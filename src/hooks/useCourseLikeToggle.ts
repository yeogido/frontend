import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useCourseLikeMutation } from './useCourses';
import { useLoginModal } from './useLoginModal';
import { useAuthStore } from '../store/auth.store';
import { updateRecentCourseLikeState } from '../utils/recentCourses';

export function useCourseLikeToggle() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const likeMutation = useCourseLikeMutation();
  const queryClient = useQueryClient();
  const [likedOverrides, setLikedOverrides] = useState<
    Record<number, boolean>
  >({});
  const [pendingCourseIds, setPendingCourseIds] = useState<
    ReadonlySet<number>
  >(() => new Set());

  const getLiked = (courseId: number, defaultLiked: boolean) =>
    likedOverrides[courseId] ?? defaultLiked;

  const toggleLike = (courseId: number, currentLiked: boolean) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (pendingCourseIds.has(courseId)) {
      return;
    }

    setPendingCourseIds((previous) => new Set(previous).add(courseId));
    setLikedOverrides((previous) => ({
      ...previous,
      [courseId]: !currentLiked,
    }));

    likeMutation.mutate(
      { courseId, isLiked: currentLiked },
      {
        onSuccess: (result) => {
          updateRecentCourseLikeState(courseId, result.isLiked);
        },
        onError: () => {
          setLikedOverrides((previous) => ({
            ...previous,
            [courseId]: currentLiked,
          }));
        },
        onSettled: () => {
          setPendingCourseIds((previous) => {
            const next = new Set(previous);
            next.delete(courseId);
            return next;
          });
          queryClient.invalidateQueries({ queryKey: ['courses'] });
          queryClient.invalidateQueries({ queryKey: ['popularCourses'] });
        },
      }
    );
  };

  return { getLiked, toggleLike };
}
