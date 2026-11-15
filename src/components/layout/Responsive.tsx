import type { ReactNode } from 'react';

import { DESKTOP_SCALE } from '../../constants/layout';
import { ScaleContext } from '../../contexts/ScaleContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';

export interface ResponsiveProps {
  readonly desktop: ReactNode;
  readonly mobile: ReactNode;
}

/**
 * 화면 진입점(라우트 element)에서 데스크톱/모바일 뷰를 고르는 스위치.
 * 데스크톱 쪽은 scale을 1로 고정해 감싸므로, 안에서 쓰는 공용 컴포넌트가
 * 뷰포트 폭에 따라 커지지 않는다.
 */
function Responsive({ desktop, mobile }: ResponsiveProps) {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return mobile;
  }

  return (
    <ScaleContext.Provider value={DESKTOP_SCALE}>
      {desktop}
    </ScaleContext.Provider>
  );
}

export default Responsive;
