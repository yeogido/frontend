import type { ReactNode } from 'react';

import DesktopFooter from '../../layout/desktop/DesktopFooter';
import DesktopHeader from '../../layout/desktop/DesktopHeader';

// Figma 1440 데스크톱 시안(로그인 5661:26957 등) 기준 리터럴 px.
const CARD_WIDTH = 468;
const CARD_PADDING_X = 62;
const CARD_PADDING_Y = 42;
const CARD_RADIUS = 28;
const CONTENT_PADDING_Y = 80;

interface AuthDesktopLayoutProps {
  readonly children: ReactNode;
}

/**
 * 인증 화면(로그인·회원가입·비밀번호 찾기)의 데스크톱 공통 뼈대 —
 * 헤더, 회색 배경 가운데의 468px 카드, 푸터.
 */
function AuthDesktopLayout({ children }: AuthDesktopLayoutProps) {
  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <DesktopHeader />

      <main
        style={{
          paddingTop: CONTENT_PADDING_Y,
          paddingBottom: CONTENT_PADDING_Y,
        }}
        className="flex flex-1 justify-center px-[24px]"
      >
        <div
          style={{
            width: CARD_WIDTH,
            paddingLeft: CARD_PADDING_X,
            paddingRight: CARD_PADDING_X,
            paddingTop: CARD_PADDING_Y,
            paddingBottom: CARD_PADDING_Y,
            borderRadius: CARD_RADIUS,
          }}
          className="h-fit shrink-0 bg-white"
        >
          {children}
        </div>
      </main>

      <DesktopFooter />
    </div>
  );
}

export default AuthDesktopLayout;
