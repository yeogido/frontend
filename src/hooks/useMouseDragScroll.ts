import { useEffect, useRef } from 'react';
import type { DragEvent, MouseEvent } from 'react';

const DRAG_THRESHOLD = 5;

/** 마우스 드래그만 처리하며 터치와 키보드 스크롤은 브라우저에 맡긴다. */
export function useMouseDragScroll({ smoothSnap = false } = {}) {
  const cleanupRef = useRef<(() => void) | null>(null);
  const draggedRef = useRef(false);

  useEffect(() => () => cleanupRef.current?.(), []);

  const onMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0) return;

    cleanupRef.current?.();
    draggedRef.current = false;
    const container = event.currentTarget;
    const startX = event.clientX;
    const startScroll = container.scrollLeft;
    const originalSnap = container.style.scrollSnapType;

    const onMove = (move: globalThis.MouseEvent) => {
      const distance = move.clientX - startX;
      if (!draggedRef.current && Math.abs(distance) < DRAG_THRESHOLD) return;
      if (!draggedRef.current && smoothSnap)
        container.style.scrollSnapType = 'none';
      draggedRef.current = true;
      container.scrollLeft = startScroll - distance;
      move.preventDefault();
    };
    const cleanup = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', cleanup);
      if (smoothSnap) container.style.scrollSnapType = originalSnap;
      cleanupRef.current = null;
    };
    const onMouseUp = () => {
      const itemWidth =
        container.firstElementChild?.getBoundingClientRect().width ?? 0;
      const target = itemWidth
        ? Math.round(container.scrollLeft / itemWidth) * itemWidth
        : container.scrollLeft;
      cleanup();
      if (smoothSnap && draggedRef.current && itemWidth) {
        const reduceMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        container.scrollTo({
          left: target,
          behavior: reduceMotion ? 'auto' : 'smooth',
        });
      }
    };

    cleanupRef.current = cleanup;
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', cleanup);
  };

  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (event.detail === 0 || !draggedRef.current) return;
    draggedRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const onDragStart = (event: DragEvent<HTMLElement>) => event.preventDefault();

  return { onMouseDown, onClickCapture, onDragStart };
}
