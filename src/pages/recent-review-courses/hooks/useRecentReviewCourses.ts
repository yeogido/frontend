import { useCallback } from 'react';

import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { useOpenReviewInCourseDetail } from '../../../hooks/useOpenReviewInCourseDetail';
import {
  getReviewsFromPages,
  useReviewDelete,
  useReviewEdit,
  useReviews,
} from '../../../hooks/useReviews';
import { toReviewCourseCardProps } from '../../../utils/reviewCard';

/**
 * 최근 후기 목록의 데이터와 파생 상태를 모은다. 화면은 이 훅이 돌려주는
 * 값만 그린다.
 */
export function useRecentReviewCourses() {
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviews('LATEST');
  const { requestDelete, dialogProps } = useReviewDelete();
  const { requestEdit, editorProps } = useReviewEdit();
  const goToCourseDetail = useOpenReviewInCourseDetail();

  const reviews = getReviewsFromPages(data?.pages).map(toReviewCourseCardProps);

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
    reviews,
    isPending,
    isError,
    isFetchingNextPage,
    loadMoreRef,
    requestDelete,
    dialogProps,
    requestEdit,
    editorProps,
    goToCourseDetail,
  };
}

export default useRecentReviewCourses;
