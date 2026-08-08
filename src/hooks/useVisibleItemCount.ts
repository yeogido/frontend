import { useLayoutEffect, useRef, useState } from 'react';

/**
 * 한 줄에 다 못 들어가는 항목(메타 문구·태그 칩)을 잘린 채로 보여주지 않고
 * 통째로 감추기 위한 훅. 실제 폭은 글자 수에 따라 달라져서 계산으로는
 * 알 수 없으므로, 같은 항목을 invisible 영역에 한 번 그려 폭을 재고
 * 컨테이너에 들어가는 개수만 돌려준다.
 *
 * itemsKey는 항목 내용이 바뀌었을 때 다시 재도록 하는 키다.
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
