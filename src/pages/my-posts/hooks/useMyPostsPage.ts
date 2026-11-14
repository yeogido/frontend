import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '../../../apis/common';
import { getCourseDetail } from '../../../apis/courses';
import { useToast } from '../../../components/toast';
import { useBusinessPromotionDelete } from '../../../hooks/useBusinessPromotions';
import {
  useCourseDelete,
  useNavigateToCourseDetail,
} from '../../../hooks/useCourses';
import { useEditCourse } from '../../../hooks/useEditCourse';
import { useEditLocalCourse } from '../../../hooks/useEditLocalCourse';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { getMyPostsFromPages, useMyPosts } from '../../../hooks/useMyPosts';
import { useIsBusinessUser } from '../../../hooks/useMyProfile';
import {
  useReviewDelete,
  useReviewDetailModal,
  useReviewEdit,
} from '../../../hooks/useReviews';
import {
  buildBusinessPromotionEditPath,
  buildLocalBusinessDetailPath,
} from '../../../utils/routes';
import { toCourseDetailState } from '../../../utils/reviewNavigation';
import {
  MY_POST_CATEGORY_OPTIONS,
  MY_POST_SORT_OPTIONS,
  myPostCategoryByLabel,
  myPostSortByLabel,
  type MyPostFilterKey,
} from '../constants/filters';
import { toMyPostReviewCardProps } from '../utils/myPostReviewCard';
import useMyPostFilters from './useMyPostFilters';

/**
 * 등록한 게시물 화면의 상태·데이터·동작. 모바일과 데스크톱 뷰가 같이 쓴다.
 */
export function useMyPostsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { showToast } = useToast();
  const { goToCourseDetail, prefetchCourseDetail } =
    useNavigateToCourseDetail();
  const isBusinessUser = useIsBusinessUser();
  const { editCourse } = useEditCourse();
  const { editLocalCourse } = useEditLocalCourse();

  const [keyword, setKeyword] = useState('');

  const {
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
  } = useMyPostFilters();

  const category = myPostCategoryByLabel[selectedFilters.category];
  const sort = myPostSortByLabel[selectedFilters.sort];

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyPosts(category, sort, keyword);

  const items = getMyPostsFromPages(data?.pages);

  const { requestDelete, dialogProps } = useReviewDelete();
  const {
    requestDelete: requestCourseDelete,
    dialogProps: courseDeleteDialogProps,
  } = useCourseDelete();
  const {
    requestDelete: requestPromotionDelete,
    dialogProps: promotionDeleteDialogProps,
  } = useBusinessPromotionDelete();
  const { requestEdit, editorProps } = useReviewEdit();

  const reviewsForModal = items.flatMap((item) =>
    item.review ? [toMyPostReviewCardProps(item.review, item.course)] : []
  );
  const { openedReview, openReview, closeReview } =
    useReviewDetailModal(reviewsForModal);

  /**
   * 후기 카드를 누르면 그 코스의 상세로 가서 후기 상세를 띄운다.
   *
   * 이 화면은 코스 타입(OFFICIAL·LOCAL)을 모르므로 goToCourseDetail이 코스를
   * 먼저 조회해 경로를 정한다. 코스를 모르는 후기는 갈 곳이 없어 이 화면에서
   * 모달로 연다.
   */
  const openReviewDetail = async (review: {
    id: number;
    courseId?: number;
    content: string;
    images: string[];
    profileImage: string;
    nickname: string;
    meta: string;
    rating: number;
  }) => {
    if (review.courseId === undefined) {
      openReview(review.id);
      return;
    }

    await prefetchCourseDetail(review.courseId);
    await goToCourseDetail(review.courseId, toCourseDetailState(review));
  };

  /**
   * 코스 카드 "수정" — 이 목록은 여기도(OFFICIAL)/우리동네(LOCAL) 코스가
   * 섞여 나오는데 목록 응답엔 구분 필드가 없다(courseType 없음). 상세
   * 조회 응답에는 courseType이 있어서, 먼저 상세를 받아 그 값으로
   * useEditCourse(관리자·여기도)와 useEditLocalCourse(우리동네) 중 맞는
   * 쪽으로 분기한다. goToCourseDetail과 같은 쿼리 키를 써서, 방금 그
   * 카드를 눌러봤다면 캐시를 그대로 재사용한다.
   */
  const handleEditCourse = async (courseId: number) => {
    try {
      const course = await queryClient.fetchQuery({
        queryKey: ['courseDetail', courseId],
        queryFn: () => getCourseDetail(courseId),
        staleTime: 60_000,
      });

      if (course.courseType === 'OFFICIAL') {
        await editCourse(courseId);
      } else {
        await editLocalCourse(courseId);
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, '코스 정보를 불러오지 못했어요.'));
    }
  };

  const goToPromotion = (promotionId: number) =>
    navigate(buildLocalBusinessDetailPath(promotionId));
  const editPromotion = (promotionId: number) =>
    navigate(buildBusinessPromotionEditPath(promotionId));

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: handleIntersect,
  });

  // 일반 사용자에게는 홍보글 필터 옵션 자체를 안 보여준다 — 골라봐야
  // 항상 빈 결과라 혼란만 준다.
  const categoryOptions = isBusinessUser
    ? MY_POST_CATEGORY_OPTIONS
    : MY_POST_CATEGORY_OPTIONS.filter((option) => option !== '홍보글');

  const filterGroups = [
    { key: 'category', options: categoryOptions },
    { key: 'sort', options: MY_POST_SORT_OPTIONS },
  ] as const satisfies readonly {
    key: MyPostFilterKey;
    options: readonly string[];
  }[];

  return {
    isBusinessUser,
    setKeyword,
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
    categoryOptions,
    filterGroups,
    items,
    isPending,
    isError,
    refetch,
    isFetchingNextPage,
    loadMoreRef,
    goToCourseDetail,
    openReviewDetail,
    handleEditCourse,
    goToPromotion,
    editPromotion,
    requestDelete,
    requestEdit,
    requestCourseDelete,
    requestPromotionDelete,
    dialogs: {
      editorProps,
      dialogProps,
      courseDeleteDialogProps,
      promotionDeleteDialogProps,
      openedReview,
      closeReview,
    },
  };
}
