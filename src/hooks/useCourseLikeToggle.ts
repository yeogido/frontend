import { useState } from 'react';

import { useCourseLikeMutation } from './useCourses';
import { useLoginModal } from './useLoginModal';
import { useAuthStore } from '../store/auth.store';

export function useCourseLikeToggle() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const likeMutation = useCourseLikeMutation();
  const [likedOverrides, setLikedOverrides] = useState<
    Record<number, boolean>
  >({});

  const getLiked = (courseId: number, defaultLiked: boolean) =>
    likedOverrides[courseId] ?? defaultLiked;

  const toggleLike = (courseId: number, currentLiked: boolean) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setLikedOverrides((previous) => ({
      ...previous,
      [courseId]: !currentLiked,
    }));

    likeMutation.mutate(
      { courseId, isLiked: currentLiked },
      {
        onError: () => {
          setLikedOverrides((previous) => ({
            ...previous,
            [courseId]: currentLiked,
          }));
        },
      }
    );
  };

  return { getLiked, toggleLike };
}
