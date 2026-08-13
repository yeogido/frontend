import { useLayoutEffect, useRef, useState } from 'react';

/**
 * 콘텐츠 높이가 가변적인 컴포넌트를 위한 보조 훅.
 * scale은 외부(useGlobalScale)에서 전달받고,
 * inner의 원본(transform 적용 전) 높이를 offsetHeight로 측정해
 * scale을 곱한 값을 돌려준다.
 *
 * offsetHeight를 쓰는 이유: getBoundingClientRect()는 이미 transform이
 * 적용된 화면상 크기를 반환하므로, 여기서 다시 scale을 곱하면 이중으로
 * 축소/확대되어 값이 어긋난다 (CourseCard에서 겪었던 버그와 동일 원인).
 */
export function useMeasuredScaledHeight(scale: number) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [scaledHeight, setScaledHeight] = useState<number>();

  useLayoutEffect(() => {
    const inner = innerRef.current;

    if (!inner) {
      return;
    }

    const update = () => setScaledHeight(inner.offsetHeight * scale);

    update();

    const observer = new ResizeObserver(update);
    observer.observe(inner);

    return () => observer.disconnect();
  }, [scale]);

  return { innerRef, scaledHeight };
}