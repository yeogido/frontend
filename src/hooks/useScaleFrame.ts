import { useLayoutEffect, useRef, useState } from 'react';

/**
 * 컴포넌트 고유의 Figma 디자인 폭(designWidth) 기준 콘텐츠를
 * 실제 렌더 폭에 맞춰 transform: scale()로 통째로 확대/축소하기 위한 훅.
 *
 * designWidth는 "화면 전체 폭(390)"이 아니라 "이 컴포넌트 자체의 Figma 폭"이어야 한다.
 * 예: CourseCard는 342, ContentCard는 163.
 */
export function useScaleFrame(designWidth: number) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number>();

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;

    if (!outer || !inner) {
      return;
    }

    const update = () => {
      const outerWidth = outer.getBoundingClientRect().width;
      const nextScale = outerWidth / designWidth;

      // offsetHeight는 CSS transform의 영향을 받지 않는
      // "원본(디자인 기준) 레이아웃 높이"를 그대로 돌려준다.
      // getBoundingClientRect()를 쓰면 이미 이전 scale이 반영된 값이라
      // 여기서 다시 scale을 곱하면 이중으로 축소/확대되어 값이 어긋난다.
      const innerHeight = inner.offsetHeight;

      setScale(nextScale);
      setScaledHeight(innerHeight * nextScale);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);

    return () => observer.disconnect();
  }, [designWidth]);

  return { outerRef, innerRef, scale, scaledHeight };
}