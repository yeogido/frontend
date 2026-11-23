import { useState } from 'react';

/**
 * 상세에 갔다가 뒤로 와도 슬라이드 위치가 유지되도록 sessionStorage에 둔다.
 * 저장소를 못 쓰는 환경에서는 그냥 메모리 상태로 동작한다.
 */
export function usePersistedIndex(key: string, count: number) {
  const [index, setIndexState] = useState(() => {
    try {
      const saved = Number(window.sessionStorage.getItem(key));

      return Number.isInteger(saved) && saved >= 0 && saved < count ? saved : 0;
    } catch {
      return 0;
    }
  });

  const setIndex = (next: number) => {
    setIndexState(next);

    try {
      window.sessionStorage.setItem(key, String(next));
    } catch {
      // 저장 실패는 무시한다.
    }
  };

  return [index, setIndex] as const;
}
