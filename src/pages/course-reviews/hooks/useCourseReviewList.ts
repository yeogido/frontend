import { useCallback, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { useCourseDetail } from '../../../hooks/useCourses';
import {
  getCourseReviewsFromPages,
  isCourseNotFoundError,
  useCourseReviews,
  useReviewDelete,
  useReviewDetailModal,
  useReviewEdit,
} from '../../../hooks/useReviews';
import type { CourseReviewType } from '../../../utils/courseReviewRoute';
import { mapCourseReviewPreviews } from '../../detail/mappers/courseReviewMapper';
import type { CourseReviewSort } from '../constants/courseReviewSort';

interface CourseReviewListLocationState {
  courseTitle?: string;
}

/**
 * 코스 후기 전체보기 화면의 데이터와 파생 상태를 모은다. 화면은 이 훅이
 * 돌려주는 값만 그린다.
 */
export function useCourseReviewList() {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const [sort, setSort] = useState<CourseReviewSort>('latest');

  const { courseTitle: courseTitleFromState = '' } =
    (location.state as CourseReviewListLocationState | null) ?? {};
  const courseType: CourseReviewType = location.pathname.startsWith(
    '/local-course/'
  )
    ? 'local-course'
    : 'yeogido-course';

  const parsedCourseId = Number(courseId);
  const validCourseId = Number.isInteger(parsedCourseId)
    ? parsedCourseId
    : undefined;

  const {
    data,
    error,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCourseReviews(validCourseId, sort === 'rating' ? 'RATING' : 'LATEST');

  // 코스 상세에서 넘어오면 제목이 state에 실려 오지만, 주소로 바로 들어오면
  // 없다. 그때만 코스를 읽어 채운다(state가 있으면 캐시가 없어도 조회하지
  // 않는다).
  const {
    data: courseDetail,
    error: courseError,
    isError: isCourseError,
  } = useCourseDetail(courseTitleFromState ? null : (validCourseId ?? null));
  const courseTitle = courseTitleFromState || (courseDetail?.title ?? '');

  // 코스가 없는 것과 후기 조회가 실패한 것은 사용자가 할 수 있는 일이 다르다.
  //
  // 주소로 바로 들어오면 코스가 없다는 사실을 코스 조회가 먼저 알려준다.
  // 후기 목록은 없는 코스에도 빈 결과를 돌려줄 수 있어, 후기 쪽만 보면
  // "아직 등록된 후기가 없습니다"로 잘못 안내하고 작성 버튼까지 남는다.
  const isCourseMissing =
    validCourseId === undefined ||
    (isError && isCourseNotFoundError(error)) ||
    (isCourseError && isCourseNotFoundError(courseError));
  // courseId가 잘못되면 쿼리가 비활성이라 isPending이 계속 true다. 그대로
  // 두면 스피너가 멈추지 않으므로 로딩으로 보지 않는다.
  const isLoading = validCourseId !== undefined && isPending;

  const { requestDelete, dialogProps } = useReviewDelete();
  const { requestEdit, editorProps } = useReviewEdit();

  const reviews = mapCourseReviewPreviews(getCourseReviewsFromPages(data?.pages));
  const { openedReview, openReview, closeReview } =
    useReviewDetailModal(reviews);

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: handleIntersect,
  });

  return {
    courseId: validCourseId,
    courseType,
    courseTitle,
    sort,
    setSort,
    reviews,
    isCourseMissing,
    isLoading,
    isError,
    isFetchingNextPage,
    loadMoreRef,
    requestDelete,
    dialogProps,
    requestEdit,
    editorProps,
    openedReview,
    openReview,
    closeReview,
  };
}

export default useCourseReviewList;
