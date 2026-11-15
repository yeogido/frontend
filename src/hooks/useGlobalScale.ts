import { useContext, useLayoutEffect, useState } from 'react';

import { ScaleContext } from '../contexts/ScaleContext';
import { getAppScale } from '../utils/responsiveLayout';

/**
 * The app-wide scale based on the layout viewport.
 * It is clamped to the supported 320px through 500px range.
 *
 * ScaleContext로 감싼 서브트리에서는 그 고정값이 우선한다 — 데스크톱 뷰처럼
 * 비례 확대를 쓰지 않는 화면을 위한 것이다.
 */
export function useGlobalScale() {
  const fixedScale = useContext(ScaleContext);
  const [viewportScale, setViewportScale] = useState(1);

  useLayoutEffect(() => {
    const update = () => {
      const layoutViewportWidth =
        document.documentElement.clientWidth || window.innerWidth;

      setViewportScale(getAppScale(layoutViewportWidth));
    };

    update();
    window.addEventListener('resize', update);

    return () => window.removeEventListener('resize', update);
  }, []);

  return fixedScale ?? viewportScale;
}
