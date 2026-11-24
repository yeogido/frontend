import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * 목록에서 상세로 갔다가 뒤로 가기로 돌아오면 이전 스크롤 위치로 복원한다.
 *
 * 돌려주는 saveScroll을 상세로 이동하기 직전에 부른다(이동 후에는 스크롤이 이미
 * 초기화돼 있을 수 있다). 복원은 뒤로/앞으로 가기(POP)로 들어왔고 목록이
 * 준비(ready)됐을 때 한 번만 한다 — 링크로 새로 들어온 경우는 맨 위에서 시작한다.
 */
export function useScrollRestoration(ready: boolean) {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();
  const key = `scroll-restore:${pathname}${search}`;
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if (!ready || hasRestoredRef.current) return;

    hasRestoredRef.current = true;
    if (navigationType !== 'POP') return;

    try {
      const saved = Number(window.sessionStorage.getItem(key));

      if (saved > 0) {
        window.requestAnimationFrame(() => window.scrollTo(0, saved));
      }
    } catch {
      // 저장소를 못 쓰면 복원하지 않는다.
    }
  }, [ready, key, navigationType]);

  return useCallback(() => {
    try {
      window.sessionStorage.setItem(key, String(window.scrollY));
    } catch {
      // 저장 실패는 무시한다.
    }
  }, [key]);
}
