import { useLayoutEffect, useState } from 'react';

import { APP_MAX_WIDTH } from '../constants/layout';

export const GLOBAL_DESIGN_WIDTH = 390;

/**
 * 앱 전체가 공유하는 단일 스케일 값.
 * (min(viewport 폭, APP_MAX_WIDTH)) / 390
 *
 * APP_MAX_WIDTH(500)보다 좁은 화면(모바일)에서는 Math.min이
 * window.innerWidth를 그대로 통과시키므로 기존 동작과 동일하다.
 * 500px를 넘는 화면(데스크탑)에서만 scale이 500/390에서 멈춘다.
 */
export function useGlobalScale() {
  const [scale, setScale] = useState(() =>
    typeof window === 'undefined'
      ? 1
      : Math.min(window.innerWidth, APP_MAX_WIDTH) / GLOBAL_DESIGN_WIDTH,
  );

  useLayoutEffect(() => {
    const update = () =>
      setScale(
        Math.min(window.innerWidth, APP_MAX_WIDTH) / GLOBAL_DESIGN_WIDTH,
      );

    update();
    window.addEventListener('resize', update);

    return () => window.removeEventListener('resize', update);
  }, []);

  return scale;
}