import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addContentLike, removeContentLike } from '../apis/courses';
import { useLoginModal } from './useLoginModal';
import { useAuthStore } from '../store/auth.store';
import {
  getStoredContentLikeOverrides,
  setStoredContentLikeOverride,
} from '../utils/contentLikeOverrides';
import { updateRecentCultureContentLikeState } from '../utils/recentCultureContents';

interface ToggleContentLikeVariables {
  contentId: number;
  isLiked: boolean;
}

export function useContentLikeToggle() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const queryClient = useQueryClient();
  const [likedOverrides, setLikedOverrides] = useState<
    Record<number, boolean>
  >(() => getStoredContentLikeOverrides());
  const [pendingContentIds, setPendingContentIds] = useState<
    ReadonlySet<number>
  >(() => new Set());

  // onSuccess/onError/onSettled are registered here (useMutation's own
  // options), not passed per-call to mutate(). A single useMutation instance
  // has only one mutateOptions slot, which gets overwritten by whichever
  // mutate() call happens last — so per-call callbacks silently never fire
  // for any earlier still-in-flight call once a second toggleLike (for a
  // different contentId) starts. Options set here run once per Mutation
  // object instead, so every concurrent call resolves correctly.
  const likeMutation = useMutation({
    mutationFn: ({ contentId, isLiked }: ToggleContentLikeVariables) =>
      isLiked ? removeContentLike(contentId) : addContentLike(contentId),
    onSuccess: (result, { contentId }) => {
      setLikedOverrides((previous) => ({
        ...previous,
        [contentId]: result.isLiked,
      }));
      setStoredContentLikeOverride(contentId, result.isLiked);
      updateRecentCultureContentLikeState(contentId, result.isLiked);
    },
    onError: (_error, { contentId, isLiked }) => {
      setLikedOverrides((previous) => ({
        ...previous,
        [contentId]: isLiked,
      }));
    },
    onSettled: (_data, _error, { contentId }) => {
      setPendingContentIds((previous) => {
        const next = new Set(previous);
        next.delete(contentId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['cultureContents'] });
      queryClient.invalidateQueries({ queryKey: ['cultureContent', contentId] });
    },
  });

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

    likeMutation.mutate({ contentId, isLiked: currentLiked });
  };

  return { getLiked, toggleLike };
}
