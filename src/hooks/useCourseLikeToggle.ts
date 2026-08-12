import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addCourseLike, removeCourseLike } from '../apis/courses';
import { useLoginModal } from './useLoginModal';
import { useAuthStore } from '../store/auth.store';
import { updateRecentCourseLikeState } from '../utils/recentCourses';

interface ToggleCourseLikeVariables {
  courseId: number;
  isLiked: boolean;
  authGeneration: number;
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
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);

  // 비로그인 상태는 좋아요를 가질 수 없으므로, 로그아웃하면 이 화면이
  // 언마운트되지 않아도 눌러뒀던 하트 표시가 바로 풀리게 한다. 렌더 중에
  // 바로 반영해야 해서(useEffect의 setState는 린트로 금지) 이전 인증
  // 상태와 비교해 바뀐 순간 초기화한다.
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
  // different courseId) starts. Options set here run once per Mutation
  // object instead, so every concurrent call resolves correctly.
  const likeMutation = useMutation({
    mutationFn: ({ courseId, isLiked }: ToggleCourseLikeVariables) =>
      isLiked ? removeCourseLike(courseId) : addCourseLike(courseId),
    onSuccess: (result, { courseId, authGeneration }) => {
      // 요청이 나간 뒤 로그아웃(또는 재로그인)해서 인증 세대가 바뀌었다면,
      // 지금은 이 응답을 신뢰할 세션이 아니므로 어떤 상태도 건드리지 않는다.
      if (useAuthStore.getState().authGeneration !== authGeneration) {
        return;
      }

      updateRecentCourseLikeState(courseId, result.isLiked);
    },
    onError: (_error, { courseId, isLiked, authGeneration }) => {
      if (useAuthStore.getState().authGeneration !== authGeneration) {
        return;
      }

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
      queryClient.invalidateQueries({ queryKey: ['popularLocalCourses'] });
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

    likeMutation.mutate({
      courseId,
      isLiked: currentLiked,
      authGeneration: useAuthStore.getState().authGeneration,
    });
  };

  return { getLiked, toggleLike };
}
