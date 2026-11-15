import { useSyncExternalStore } from 'react';

import { DESKTOP_MEDIA_QUERY } from '../utils/responsiveLayout';

let mediaQueryList: MediaQueryList | null = null;

function getMediaQueryList() {
  mediaQueryList ??= window.matchMedia(DESKTOP_MEDIA_QUERY);

  return mediaQueryList;
}

function subscribe(onStoreChange: () => void) {
  const list = getMediaQueryList();
  list.addEventListener('change', onStoreChange);

  return () => list.removeEventListener('change', onStoreChange);
}

/**
 * 데스크톱 전용 레이아웃을 써야 하는지. 폭 기준은 DESKTOP_MIN_WIDTH 하나뿐이고
 * (태블릿은 모바일 UI를 그대로 쓴다) 분기는 화면 진입점에서만 한다 — 컴포넌트
 * 내부에 조건을 흩뿌리면 두 레이아웃이 한 트리에 섞여 유지가 안 된다.
 */
export function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => getMediaQueryList().matches,
    () => false
  );
}
