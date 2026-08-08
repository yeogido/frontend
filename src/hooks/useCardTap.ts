import { useCallback, useRef } from 'react';
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';

// 손가락이 이만큼 움직였으면 목록을 스크롤하려는 것으로 보고 탭으로 치지 않는다.
const MOVE_TOLERANCE = 10;

interface UseCardTapParams {
  onTap: () => void;
}

/**
 * 카드 전체를 누르는 탭.
 *
 * 이동량은 포인터로 재지만 실행은 click에서 한다. pointerup에서 바로 열면
 * 뒤이어 오는 click이 그 자리에 새로 뜬 모달의 버튼에 꽂혀, 모달이 열리는
 * 동시에 그 버튼까지 눌리는 일이 생긴다.
 *
 * click만 쓰지 않는 이유는, 카드가 가로 캐러셀(홈 후기)이나 스크롤 목록
 * 안에 있어서 넘기려고 누른 채 움직인 것까지 탭으로 처리하면 안 되기 때문이다.
 *
 * 취소는 pointercancel(브라우저가 스크롤로 가져간 경우)과 이동량으로만
 * 판단한다. pointerleave는 쓰면 안 된다 — 터치에서는 손을 뗄 때
 * pointerup 다음, click보다 먼저 날아와서 멀쩡한 탭까지 지운다.
 */
export function useCardTap({ onTap }: UseCardTapParams) {
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const isCanceledRef = useRef(true);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      startPointRef.current = null;
      isCanceledRef.current = true;

      // 주 버튼(왼쪽 클릭·터치·펜)만 다룬다. 그러지 않으면 데스크톱에서
      // 우클릭만 해도 카드가 눌린 것으로 처리된다.
      if (event.button !== 0) {
        return;
      }

      // 카드 위의 더보기 같은 버튼을 누른 것이면 카드 동작을 걸지 않는다.
      if (event.target !== event.currentTarget && isInteractive(event.target)) {
        return;
      }

      startPointRef.current = { x: event.clientX, y: event.clientY };
      isCanceledRef.current = false;
    },
    []
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const start = startPointRef.current;

      if (!start || isCanceledRef.current) return;

      const movedFar =
        Math.abs(event.clientX - start.x) > MOVE_TOLERANCE ||
        Math.abs(event.clientY - start.y) > MOVE_TOLERANCE;

      if (movedFar) {
        isCanceledRef.current = true;
      }
    },
    []
  );

  const handlePointerCancel = useCallback(() => {
    isCanceledRef.current = true;
  }, []);

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      const isCanceled = isCanceledRef.current;

      // 다음 눌림 전까지는 어떤 click도 탭으로 보지 않는다.
      isCanceledRef.current = true;
      startPointRef.current = null;

      if (isCanceled) return;

      // 포인터가 움직여 카드 위 버튼에서 끝났을 수 있어 여기서 한 번 더 본다.
      if (event.target !== event.currentTarget && isInteractive(event.target)) {
        return;
      }

      onTap();
    },
    [onTap]
  );

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerCancel: handlePointerCancel,
    onClick: handleClick,
  };
}

function isInteractive(target: EventTarget): boolean {
  if (!(target instanceof Element)) return false;

  return Boolean(target.closest('button, a, input, textarea, select'));
}
