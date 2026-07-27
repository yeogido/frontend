import { useLayoutEffect, useState } from 'react';

import { getAppScale } from '../utils/responsiveLayout';

/**
 * The app-wide scale based on the layout viewport.
 * It is clamped to the supported 320px through 500px range.
 */
export function useGlobalScale() {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const update = () => {
      const layoutViewportWidth =
        document.documentElement.clientWidth || window.innerWidth;

      setScale(getAppScale(layoutViewportWidth));
    };

    update();
    window.addEventListener('resize', update);

    return () => window.removeEventListener('resize', update);
  }, []);

  return scale;
}
