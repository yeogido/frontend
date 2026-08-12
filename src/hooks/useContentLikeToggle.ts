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
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);

  // 비로그인 상태는 좋아요를 가질 수 없으므로, 로그아웃하면 이 화면이
  // 언마운트되지 않아도 눌러뒀던 하트 표시가 바로 풀리게 한다(localStorage
  // 백업본은 useResetLikesOnLogout이 별도로 정리한다). 렌더 중에 바로
  // 반영해야 해서(useEffect의 setState는 린트로 금지) 이전 인증 상태와
  // 비교해 바뀐 순간 초기화한다.
  if (wasAuthenticated !== isAuthenticated) {
    setWasAuthenticated(isAuthenticated);

    if (!isAuthenticated) {
      setLikedOverrides({});
    }
  }

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
