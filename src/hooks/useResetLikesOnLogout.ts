import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../store/auth.store';
import { clearStoredContentLikeOverrides } from '../utils/contentLikeOverrides';
import { clearRecentCoursesLikedState } from '../utils/recentCourses';
import { clearRecentCultureContentsLikedState } from '../utils/recentCultureContents';

// 비로그인 사용자는 좋아요 상태를 가질 수 없다. 로그인 응답/캐시/로컬
// 저장소 어디에 남아있든, 로그아웃(또는 세션 만료로 인한 clearAuth) 직후
// 이전에 눌러둔 하트 표시가 전부 풀리도록 한 곳에서 정리한다. clearAuth는
// 로그아웃 버튼, 401 인터셉터, 만료 세션 정리 등 여러 곳에서 호출되므로
// 호출부마다 정리 로직을 반복하는 대신 isAuthenticated 전환을 구독한다.
export function useResetLikesOnLogout(): void {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const wasAuthenticatedRef = useRef(isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    const wasAuthenticated = wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;

    if (!wasAuthenticated || isAuthenticated) {
      return;
    }

    clearStoredContentLikeOverrides();
    clearRecentCoursesLikedState();
    clearRecentCultureContentsLikedState();
    queryClient.clear();
  }, [isAuthenticated, queryClient]);
}
