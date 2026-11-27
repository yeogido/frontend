import type { ReactNode } from 'react';

import { DESKTOP_SCALE } from '../../constants/layout';
import { ScaleContext } from '../../contexts/ScaleContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';

interface ResponsiveSameTreeProps {
  readonly render: (desktop: boolean) => ReactNode;
}

/**
 * Responsive와 달리 데스크톱/모바일을 같은 트리에 그린다. 입력 중인 화면이
 * 1024px 경계를 넘어도 새로 마운트되지 않아 입력값과 제출 상태가 남는다.
 */
function ResponsiveSameTree({ render }: ResponsiveSameTreeProps) {
  const isDesktop = useIsDesktop();

  return (
    <ScaleContext.Provider value={isDesktop ? DESKTOP_SCALE : null}>
      {render(isDesktop)}
    </ScaleContext.Provider>
  );
}

export default ResponsiveSameTree;
