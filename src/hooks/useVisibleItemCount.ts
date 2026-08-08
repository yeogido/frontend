import { useLayoutEffect, useRef, useState } from 'react';

/**
 * EditableCourseCard/EditableContentCard가 공유하는, 컨테이너 폭에 맞춰
 * 몇 개까지 보여줄 수 있는지 측정하는 훅. 화면 밖 hidden 영역에 전체
 * 아이템을 렌더링해 실제 너비를 잰 뒤, 컨테이너에 들어가는 개수만
 * visibleCount로 반환한다.
 */
export function useVisibleItemCount(itemsKey: string, itemCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const hidden = hiddenRef.current;

    if (!container || !hidden || itemCount === 0) {
      setVisibleCount(0);
      return;
    }

    const recalculate = () => {
      const elements = Array.from(hidden.children) as HTMLElement[];
      const widths = elements.map((el) => el.getBoundingClientRect().width);

      if (widths.length === 0 || widths.some((w) => w === 0)) {
        return;
      }

      const style = getComputedStyle(container);
      const gap = Number.parseFloat(style.columnGap || style.gap || '0') || 0;

      const containerWidth = container.getBoundingClientRect().width;
      const EPSILON = 0.5;

      let total = 0;
      let count = 0;

      for (let i = 0; i < widths.length; i++) {
        const width = widths[i];
        const next = count === 0 ? width : total + gap + width;

        if (next > containerWidth + EPSILON) {
          break;
        }

        total = next;
        count++;
      }

      setVisibleCount(count);
    };

    recalculate();

    const observer = new ResizeObserver(recalculate);
    observer.observe(container);
    observer.observe(hidden);

    return () => observer.disconnect();
  }, [itemsKey, itemCount]);

  return { containerRef, hiddenRef, visibleCount };
}
