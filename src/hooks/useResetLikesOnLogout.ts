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
  // 부팅 시 이미 비로그인이면(로그인→로그아웃 "전환" 자체가 없는 경우)
  // wasAuthenticatedRef만으로는 절대 못 잡는다 — 예: 토큰이 만료돼
  // main.tsx의 validateStoredSession()이 리액트 마운트 전에 이미
  // clearAuth()를 불러버린 경우. 그래서 최초 1회는 전환 여부와 무관하게
  // "지금 비로그인인가"만 보고 정리한다.
  const hasCheckedInitialAuthRef = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const wasAuthenticated = wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;

    const isLogoutTransition = wasAuthenticated && !isAuthenticated;
    const isLoggedOutOnBoot =
      !hasCheckedInitialAuthRef.current && !isAuthenticated;
    hasCheckedInitialAuthRef.current = true;

    if (!isLogoutTransition && !isLoggedOutOnBoot) {
      return;
    }

    clearStoredContentLikeOverrides();
    clearRecentCoursesLikedState();
    clearRecentCultureContentsLikedState();
    queryClient.clear();
  }, [isAuthenticated, queryClient]);
}
