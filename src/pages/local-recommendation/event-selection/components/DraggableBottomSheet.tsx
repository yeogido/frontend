import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import {
  applyBoundaryResistance,
  getSnapHeights,
  resolveSnapIndex,
  SHEET_SNAP_RATIOS,
} from '../bottomSheet';

interface DraggableBottomSheetProps {
  labelledBy: string;
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

interface DragSession {
  pointerId: number | null;
  startY: number;
  startHeight: number;
  lastY: number;
  lastTime: number;
  velocityY: number;
  active: boolean;
}

const getViewportHeight = () =>
  typeof window === 'undefined'
    ? 844
    : (window.visualViewport?.height ?? window.innerHeight);

const isInteractiveTarget = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(target.closest('button, a, input, select, textarea, label'));

function DraggableBottomSheet({
  labelledBy,
  header,
  children,
  footer,
}: DraggableBottomSheetProps) {
  const initialViewportHeight = getViewportHeight();
  const [viewportHeight, setViewportHeight] = useState(initialViewportHeight);
  const [snapIndex, setSnapIndex] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(
    getSnapHeights(initialViewportHeight)[0]
  );
  const [isDragging, setIsDragging] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const viewportHeightRef = useRef(initialViewportHeight);
  const snapIndexRef = useRef(0);
  const sheetHeightRef = useRef(sheetHeight);
  const dragSessionRef = useRef<DragSession | null>(null);
  const contentPointerCandidateRef = useRef<DragSession | null>(null);

  const updateSheetHeight = useCallback((height: number) => {
    const snapHeights = getSnapHeights(viewportHeightRef.current);
    const nextHeight = applyBoundaryResistance(
      height,
      snapHeights[0],
      snapHeights[snapHeights.length - 1]
    );

    sheetHeightRef.current = nextHeight;
    setSheetHeight(nextHeight);
  }, []);

  const moveToSnap = useCallback((nextIndex: number) => {
    const boundedIndex = Math.min(
      SHEET_SNAP_RATIOS.length - 1,
      Math.max(0, nextIndex)
    );
    const nextHeight = getSnapHeights(viewportHeightRef.current)[boundedIndex];

    snapIndexRef.current = boundedIndex;
    sheetHeightRef.current = nextHeight;
    setSnapIndex(boundedIndex);
    setSheetHeight(nextHeight);
  }, []);

  const beginDrag = useCallback(
    (clientY: number, pointerId: number | null, startTime: number) => {
      dragSessionRef.current = {
        pointerId,
        startY: clientY,
        startHeight: sheetHeightRef.current,
        lastY: clientY,
        lastTime: startTime,
        velocityY: 0,
        active: true,
      };
      setIsDragging(true);
    },
    []
  );

  const moveDrag = useCallback(
    (clientY: number, currentTime: number) => {
      const session = dragSessionRef.current;

      if (!session?.active) {
        return;
      }

      const elapsed = Math.max(1, currentTime - session.lastTime);
      session.velocityY = (clientY - session.lastY) / elapsed;
      session.lastY = clientY;
      session.lastTime = currentTime;

      updateSheetHeight(session.startHeight - (clientY - session.startY));
    },
    [updateSheetHeight]
  );

  const finishDrag = useCallback(() => {
    const session = dragSessionRef.current;

    if (!session?.active) {
      return;
    }

    const velocityY =
      performance.now() - session.lastTime > 120 ? 0 : session.velocityY;
    const nextIndex = resolveSnapIndex({
      height: sheetHeightRef.current,
      velocityY,
      currentIndex: snapIndexRef.current,
      snapHeights: getSnapHeights(viewportHeightRef.current),
    });

    dragSessionRef.current = null;
    contentPointerCandidateRef.current = null;
    setIsDragging(false);
    moveToSnap(nextIndex);
  }, [moveToSnap]);

  useEffect(() => {
    const handleResize = () => {
      const nextViewportHeight = getViewportHeight();

      viewportHeightRef.current = nextViewportHeight;
      setViewportHeight(nextViewportHeight);
      moveToSnap(snapIndexRef.current);
    };

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [moveToSnap]);

  useEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    let touchCandidate: DragSession | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      if (
        event.touches.length !== 1 ||
        content.scrollTop > 0 ||
        isInteractiveTarget(event.target)
      ) {
        touchCandidate = null;
        return;
      }

      const touch = event.touches[0];
      touchCandidate = {
        pointerId: null,
        startY: touch.clientY,
        startHeight: sheetHeightRef.current,
        lastY: touch.clientY,
        lastTime: performance.now(),
        velocityY: 0,
        active: false,
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];

      if (!touch || !touchCandidate) {
        return;
      }

      const deltaY = touch.clientY - touchCandidate.startY;

      if (!touchCandidate.active) {
        if (deltaY < -5) {
          touchCandidate = null;
          return;
        }

        if (deltaY <= 5 || content.scrollTop > 0) {
          return;
        }

        beginDrag(touchCandidate.startY, null, touchCandidate.lastTime);
        touchCandidate.active = true;
      }

      event.preventDefault();
      moveDrag(touch.clientY, performance.now());
    };

    const handleTouchEnd = () => {
      if (touchCandidate?.active) {
        finishDrag();
      }

      touchCandidate = null;
    };

    content.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    content.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    content.addEventListener('touchend', handleTouchEnd);
    content.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      content.removeEventListener('touchstart', handleTouchStart);
      content.removeEventListener('touchmove', handleTouchMove);
      content.removeEventListener('touchend', handleTouchEnd);
      content.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [beginDrag, finishDrag, moveDrag]);

  const handleGripPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    if (event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    beginDrag(event.clientY, event.pointerId, performance.now());
  };

  const handleGripPointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    if (dragSessionRef.current?.pointerId !== event.pointerId) {
      return;
    }

    moveDrag(event.clientY, performance.now());
  };

  const handleGripPointerEnd = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    if (dragSessionRef.current?.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    finishDrag();
  };

  const handleContentPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (
      event.pointerType === 'touch' ||
      event.button !== 0 ||
      event.currentTarget.scrollTop > 0 ||
      isInteractiveTarget(event.target)
    ) {
      contentPointerCandidateRef.current = null;
      return;
    }

    contentPointerCandidateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: sheetHeightRef.current,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocityY: 0,
      active: false,
    };
  };

  const handleContentPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const candidate = contentPointerCandidateRef.current;

    if (!candidate || candidate.pointerId !== event.pointerId) {
      return;
    }

    const deltaY = event.clientY - candidate.startY;

    if (!candidate.active) {
      if (deltaY < -5) {
        contentPointerCandidateRef.current = null;
        return;
      }

      if (deltaY <= 5 || event.currentTarget.scrollTop > 0) {
        return;
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      beginDrag(candidate.startY, event.pointerId, candidate.lastTime);
      candidate.active = true;
    }

    event.preventDefault();
    moveDrag(event.clientY, performance.now());
  };

  const handleContentPointerEnd = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const candidate = contentPointerCandidateRef.current;

    if (!candidate || candidate.pointerId !== event.pointerId) {
      return;
    }

    if (candidate.active) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      finishDrag();
    }

    contentPointerCandidateRef.current = null;
  };

  const handleGripKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveToSnap(snapIndexRef.current + 1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveToSnap(snapIndexRef.current - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveToSnap(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveToSnap(SHEET_SNAP_RATIOS.length - 1);
    }
  };

  const currentPercentage = Math.round(SHEET_SNAP_RATIOS[snapIndex] * 100);

  return (
    <section
      aria-labelledby={labelledBy}
      data-snap-index={snapIndex}
      data-viewport-height={viewportHeight}
      className={`bg-background fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[22px] shadow-[0_-2px_12px_rgba(28,28,28,0.02)] motion-reduce:transition-none ${
        isDragging
          ? 'transition-none'
          : 'transition-[height] duration-300 ease-out'
      }`}
      style={{ height: `${sheetHeight}px` }}
    >
      <button
        type="button"
        aria-label={`행사 패널 높이 조절, 현재 ${currentPercentage}%`}
        onPointerDown={handleGripPointerDown}
        onPointerMove={handleGripPointerMove}
        onPointerUp={handleGripPointerEnd}
        onPointerCancel={handleGripPointerEnd}
        onLostPointerCapture={handleGripPointerEnd}
        onKeyDown={handleGripKeyDown}
        className="flex h-7 w-full shrink-0 cursor-grab touch-none items-start justify-center pt-2 active:cursor-grabbing"
      >
        <span aria-hidden="true" className="h-1 w-8 rounded-full bg-black" />
      </button>

      <div className="shrink-0 px-6 pb-3">{header}</div>

      <div
        ref={contentRef}
        onPointerDown={handleContentPointerDown}
        onPointerMove={handleContentPointerMove}
        onPointerUp={handleContentPointerEnd}
        onPointerCancel={handleContentPointerEnd}
        onLostPointerCapture={handleContentPointerEnd}
        className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-6"
      >
        {children}
      </div>

      <div className="shrink-0 px-6 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {footer}
      </div>
    </section>
  );
}

export default DraggableBottomSheet;
