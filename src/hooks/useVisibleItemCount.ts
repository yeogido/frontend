import { useLayoutEffect, useRef, useState } from 'react';

import {
  countFittingItems,
  selectFittingItemsWithRequiredIndex,
} from '../utils/visibleItemCount';

/**
 * 한 줄에 다 못 들어가는 항목(메타 문구·태그 칩)을 잘린 채로 보여주지 않고
 * 통째로 감추기 위한 훅. 실제 폭은 글자 수에 따라 달라져서 계산으로는
 * 알 수 없으므로, 같은 항목을 invisible 영역에 한 번 그려 폭을 재고
 * 컨테이너에 들어가는 개수만 돌려준다.
 *
 * CourseCard·CourseReviewCard·ContentCard와 관리자 화면의
 * EditableCourseCard·EditableContentCard가 함께 쓴다.
 *
 * itemsKey는 항목 내용이 바뀌었을 때 다시 재도록 하는 키다.
 */
export function useVisibleItemCount(
  itemsKey: string,
  itemCount: number,
  requiredItemIndexes?: readonly number[]
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(0);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const requiredItemIndexesKey = requiredItemIndexes?.join(',');

  useLayoutEffect(() => {
    const container = containerRef.current;
    const hidden = hiddenRef.current;

    if (!container || !hidden || itemCount === 0) {
      setVisibleCount(0);
      setVisibleIndexes([]);
      return;
    }

    const recalculate = () => {
      const elements = Array.from(hidden.children) as HTMLElement[];
      const widths = elements.map((el) => el.getBoundingClientRect().width);

      const style = getComputedStyle(container);
      const gap = Number.parseFloat(style.columnGap || style.gap || '0') || 0;

      const containerWidth = container.getBoundingClientRect().width;

      const count = countFittingItems(widths, gap, containerWidth);
      const requiredIndexes = requiredItemIndexesKey
        ? requiredItemIndexesKey.split(',').map(Number)
        : undefined;
      setVisibleCount(count);
      setVisibleIndexes(
        requiredIndexes === undefined
          ? Array.from({ length: count }, (_, index) => index)
          : selectFittingItemsWithRequiredIndex(
              widths,
              gap,
              containerWidth,
              requiredIndexes
            )
      );
    };

    recalculate();

    const observer = new ResizeObserver(recalculate);
    observer.observe(container);
    observer.observe(hidden);

    return () => observer.disconnect();
  }, [itemsKey, itemCount, requiredItemIndexesKey]);

  return { containerRef, hiddenRef, visibleCount, visibleIndexes };
}
