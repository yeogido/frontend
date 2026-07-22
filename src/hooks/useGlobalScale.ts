import { useLayoutEffect, useState } from 'react';

export const GLOBAL_DESIGN_WIDTH = 390;

/**
 * 앱 전체가 공유하는 단일 스케일 값 (viewport 폭 / 390).
 * Header, Sidebar, SectionHeader, Section 여백처럼
 * 자체 측정 로직이 필요 없는 단순 요소들에 사용한다.
 *
 * CourseCard/ContentCard는 각자 useScaleFrame으로 자기 렌더 폭을 직접
 * 측정하지만, 컨테이너 padding도 이 전역 scale을 따르기 때문에
 * 두 값은 항상 수학적으로 일치한다.
 */
export function useGlobalScale() {
  const [scale, setScale] = useState(() =>
    typeof window === 'undefined'
      ? 1
      : window.innerWidth / GLOBAL_DESIGN_WIDTH,
  );

  useLayoutEffect(() => {
    const update = () => setScale(window.innerWidth / GLOBAL_DESIGN_WIDTH);

    update();
    window.addEventListener('resize', update);

    return () => window.removeEventListener('resize', update);
  }, []);

  return scale;
}