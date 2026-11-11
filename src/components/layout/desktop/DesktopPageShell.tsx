import type { ReactNode } from 'react';

import DesktopFooter from './DesktopFooter';
import DesktopHeader from './DesktopHeader';

// Figma 1440 데스크톱 시안 기준 리터럴 px
const CONTENT_WIDTH = 742;
const CONTENT_PADDING_TOP = 60;
const CONTENT_PADDING_BOTTOM = 120;

export interface DesktopPageShellProps {
  readonly children: ReactNode;
}

/**
 * 데스크톱 화면의 공통 뼈대 — 헤더, 가운데 정렬된 본문 칼럼, 푸터.
 * 시안의 본문은 1440 안에서 742px 칼럼으로 가운데 정렬돼 있다.
 */
function DesktopPageShell({ children }: DesktopPageShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <DesktopHeader />

      <main
        className="mx-auto w-full flex-1"
        style={{
          maxWidth: CONTENT_WIDTH,
          paddingTop: CONTENT_PADDING_TOP,
          paddingBottom: CONTENT_PADDING_BOTTOM,
        }}
      >
        {children}
      </main>

      <DesktopFooter />
    </div>
  );
}

export default DesktopPageShell;
