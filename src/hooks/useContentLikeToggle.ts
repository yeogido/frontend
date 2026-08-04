import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { addContentLike, removeContentLike } from '../apis/courses';
import { useLoginModal } from './useLoginModal';
import { useAuthStore } from '../store/auth.store';

function useContentLikeMutation() {
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

export function useContentLikeToggle() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const likeMutation = useContentLikeMutation();
  const [likedOverrides, setLikedOverrides] = useState<
    Record<number, boolean>
  >({});
  const [pendingContentIds, setPendingContentIds] = useState<
    ReadonlySet<number>
  >(() => new Set());

  const getLiked = (contentId: number, defaultLiked: boolean) =>
    likedOverrides[contentId] ?? defaultLiked;

  const toggleLike = (contentId: number, currentLiked: boolean) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (pendingContentIds.has(contentId)) {
      return;
    }

    setPendingContentIds((previous) => new Set(previous).add(contentId));
    setLikedOverrides((previous) => ({
      ...previous,
      [contentId]: !currentLiked,
    }));

    likeMutation.mutate(
      { contentId, isLiked: currentLiked },
      {
        onSuccess: (result) => {
          setLikedOverrides((previous) => ({
            ...previous,
            [contentId]: result.isLiked,
          }));
        },
        onError: () => {
          setLikedOverrides((previous) => ({
            ...previous,
            [contentId]: currentLiked,
          }));
        },
        onSettled: () => {
          setPendingContentIds((previous) => {
            const next = new Set(previous);
            next.delete(contentId);
            return next;
          });
        },
      }
    );
  };

  return { getLiked, toggleLike };
}
