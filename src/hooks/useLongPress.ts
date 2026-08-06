import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

const LONG_PRESS_DELAY = 400;
// 손가락이 이만큼 움직이면 목록을 스크롤하려는 것으로 보고 길게 누르기를 취소한다.
const MOVE_TOLERANCE = 10;

interface UseLongPressParams {
  onLongPress: () => void;
  onClick?: () => void;
}

/**
 * 짧게 누르면 onClick, 길게 누르면 onLongPress.
 *
 * 길게 눌러 동작이 나간 뒤에는 손을 뗄 때 onClick이 뒤따르지 않게 막는다.
 * 모바일에서 길게 누르면 브라우저가 컨텍스트 메뉴나 텍스트 선택을 띄우므로
 * 그것도 함께 막는다.
 */
export function useLongPress({ onLongPress, onClick }: UseLongPressParams) {
  const timerRef = useRef<number | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const didLongPressRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      // 주 버튼(왼쪽 클릭·터치·펜)만 다룬다. 그러지 않으면 데스크톱에서
      // 우클릭만 해도 카드가 눌린 것으로 처리된다.
      if (event.button !== 0) {
        return;
      }

      // 카드 위의 좋아요/더보기 같은 버튼을 누른 것이면 카드 동작을 걸지 않는다.
      if (event.target !== event.currentTarget && isInteractive(event.target)) {
        return;
      }

      didLongPressRef.current = false;
      startPointRef.current = { x: event.clientX, y: event.clientY };
      clearTimer();

      timerRef.current = window.setTimeout(() => {
        didLongPressRef.current = true;
        onLongPress();
      }, LONG_PRESS_DELAY);
    },
    [clearTimer, onLongPress]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const start = startPointRef.current;

      if (!start || timerRef.current === null) return;

      const movedFar =
        Math.abs(event.clientX - start.x) > MOVE_TOLERANCE ||
        Math.abs(event.clientY - start.y) > MOVE_TOLERANCE;

      if (movedFar) {
        clearTimer();
        startPointRef.current = null;
      }
    },
    [clearTimer]
  );

  const handlePointerUp = useCallback(() => {
    const wasPressing = startPointRef.current !== null;

    clearTimer();
    startPointRef.current = null;

    if (didLongPressRef.current || !wasPressing) {
      return;
    }

    onClick?.();
  }, [clearTimer, onClick]);

  const handlePointerCancel = useCallback(() => {
    clearTimer();
    startPointRef.current = null;
  }, [clearTimer]);

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
    onPointerLeave: handlePointerCancel,
    onContextMenu: (event: { preventDefault: () => void }) =>
      event.preventDefault(),
  };
}

function isInteractive(target: EventTarget): boolean {
  if (!(target instanceof Element)) return false;

  return Boolean(target.closest('button, a, input, textarea, select'));
}
