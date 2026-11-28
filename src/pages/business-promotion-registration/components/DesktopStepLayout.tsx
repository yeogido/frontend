import type { ReactNode } from 'react';
import { MdChevronLeft } from 'react-icons/md';

import { DesktopPageShell } from '../../../components/layout/desktop';

interface DesktopStepLayoutProps {
  readonly contentWidth?: number;
  readonly title: string;
  readonly description: string;
  readonly onBack: () => void;
  readonly children: ReactNode;
}

/**
 * 홍보글 등록 각 단계의 데스크톱 뼈대 — 헤더, 제목, 본문.
 *
 * 시안에는 뒤로가기가 없지만, 단계는 라우트가 아니라 화면 상태라 브라우저
 * 뒤로가기는 이전 단계가 아니라 플로우 이탈이 된다. 본문 배치를 밀지 않게
 * 제목 위 여백에 둔다(왼쪽 바깥은 좁은 창에서 화면 밖으로 잘린다).
 */
function DesktopStepLayout({
  contentWidth,
  title,
  description,
  onBack,
  children,
}: DesktopStepLayoutProps) {
  return (
    <DesktopPageShell contentWidth={contentWidth}>
      <header className="relative flex flex-col gap-[6px]">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="text-gray-5 absolute -top-[44px] -left-[8px] flex size-[38px] items-center justify-center rounded-full"
        >
          <MdChevronLeft aria-hidden="true" className="text-[32px]" />
        </button>
        <h1 className="text-[32px] leading-[38px] font-semibold text-black">
          {title}
        </h1>
        <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
          {description}
        </p>
      </header>
      {children}
    </DesktopPageShell>
  );
}

export default DesktopStepLayout;
