import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addCourseLike, removeCourseLike } from '../apis/courses';
import { useLoginModal } from './useLoginModal';
import { useAuthStore } from '../store/auth.store';
import { updateRecentCourseLikeState } from '../utils/recentCourses';

interface ToggleCourseLikeVariables {
  courseId: number;
  isLiked: boolean;
}

export function useCourseLikeToggle() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const queryClient = useQueryClient();
  const [likedOverrides, setLikedOverrides] = useState<
    Record<number, boolean>
  >({});
  const [pendingCourseIds, setPendingCourseIds] = useState<
    ReadonlySet<number>
  >(() => new Set());

  // onSuccess/onError/onSettled are registered here (useMutation's own
  // options), not passed per-call to mutate(). A single useMutation instance
  // has only one mutateOptions slot, which gets overwritten by whichever
  // mutate() call happens last — so per-call callbacks silently never fire
  // for any earlier still-in-flight call once a second toggleLike (for a
  // different courseId) starts. Options set here run once per Mutation
  // object instead, so every concurrent call resolves correctly.
  const likeMutation = useMutation({
    mutationFn: ({ courseId, isLiked }: ToggleCourseLikeVariables) =>
      isLiked ? removeCourseLike(courseId) : addCourseLike(courseId),
    onSuccess: (result, { courseId }) => {
      updateRecentCourseLikeState(courseId, result.isLiked);
    },
    onError: (_error, { courseId, isLiked }) => {
      setLikedOverrides((previous) => ({
        ...previous,
        [courseId]: isLiked,
      }));
    },
    onSettled: (_data, _error, { courseId }) => {
      setPendingCourseIds((previous) => {
        const next = new Set(previous);
        next.delete(courseId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['popularCourses'] });
    },
  });

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

    likeMutation.mutate({ courseId, isLiked: currentLiked });
  };

  return { getLiked, toggleLike };
}
