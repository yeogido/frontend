import { useMutation, useQuery } from '@tanstack/react-query';

import {
  addContentLike,
  addPlaceLike,
  addCourseLike,
  getCourseDetail,
  removeContentLike,
  removePlaceLike,
  removeCourseLike,
} from '../../../apis/courses';

const DETAIL_STALE_TIME = 1000 * 60;
const DETAIL_GC_TIME = 1000 * 60 * 5;

export function useLocalCourseDetail(courseId: number | null) {
  return useQuery({
    queryKey: ['localCourseDetail', courseId],
    queryFn: () => getCourseDetail(courseId as number),
    enabled: courseId !== null,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useLocalCourseLikeMutation() {
  return useMutation({
    mutationFn: ({
      courseId,
      isLiked,
    }: {
      courseId: number;
      isLiked: boolean;
    }) => (isLiked ? removeCourseLike(courseId) : addCourseLike(courseId)),
  });
}

export function usePlaceLikeMutation() {
  return useMutation({
    mutationFn: ({
      placeId,
      isLiked,
      courseItemId,
    }: {
      placeId: number;
      isLiked: boolean;
      courseItemId: number;
    }) =>
      isLiked
        ? removePlaceLike(placeId)
        : addPlaceLike(placeId, 'COURSE_ITEM', courseItemId),
  });
}

export function useContentLikeMutation() {
  return useMutation({
    mutationFn: ({
      contentId,
      isLiked,
    }: {
      contentId: number;
      isLiked: boolean;
    }) => (isLiked ? removeContentLike(contentId) : addContentLike(contentId)),
  });
}
