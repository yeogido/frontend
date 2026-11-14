import type { ReactNode } from 'react';

import DesktopPageShell from '../../../../components/layout/desktop/DesktopPageShell';

// Figma 1440 데스크톱 시안(6330:58524 등록 흐름) 기준 리터럴 px.
const CONTENT_WIDTH = 1042;
const LEFT_COLUMN_WIDTH = 608;
const PREVIEW_COLUMN_WIDTH = 360;

interface CreateStepLayoutProps {
  title: string;
  description: string;
  /** 왼쪽 단(입력 영역). */
  children: ReactNode;
  /** 오른쪽 단의 폴더 미리보기 카드. */
  preview: ReactNode;
  actionLabel: string;
  actionDisabled?: boolean;
  actionBusy?: boolean;
  onAction: () => void;
}

/** 지역·날짜·사진·꾸미기 단계가 함께 쓰는 좌우 2단 뼈대. */
function CreateStepLayout({
  title,
  description,
  children,
  preview,
  actionLabel,
  actionDisabled = false,
  actionBusy = false,
  onAction,
}: CreateStepLayoutProps) {
  return (
    <DesktopPageShell contentWidth={CONTENT_WIDTH}>
      <header className="flex flex-col gap-[6px]">
        <h1 className="text-[32px] font-semibold text-black">{title}</h1>
        <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
          {description}
        </p>
      </header>

      <div className="mt-[24px] flex items-start justify-between">
        <div style={{ width: LEFT_COLUMN_WIDTH }}>{children}</div>
        <div
          style={{ width: PREVIEW_COLUMN_WIDTH }}
          className="flex flex-col gap-[24px]"
        >
          {preview}
          <button
            type="button"
            disabled={actionDisabled}
            aria-busy={actionBusy}
            onClick={onAction}
            className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 h-[53px] w-full rounded-[12px] text-[18px] font-semibold text-white disabled:cursor-not-allowed"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </DesktopPageShell>
  );
}

export default CreateStepLayout;
