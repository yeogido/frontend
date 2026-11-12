import type { ReactNode } from 'react';

// Figma 1440 데스크톱 시안의 우측 패널(6336:89225) 기준 리터럴 px
const PANEL_HEIGHT = 588;

interface DesktopSelectedPanelProps {
  title: string;
  emptyMessage: string;
  isEmpty: boolean;
  onRemoveAll: () => void;
  /** 선택된 항목 줄들 — DesktopSelectedRow의 li들. */
  children: ReactNode;
  submitLabel: string;
  isSubmitDisabled: boolean;
  onSubmit: () => void;
  /** 둘 다 주면 제출 버튼 아래에 건너뛰기 링크를 보여준다. */
  skipLabel?: string;
  onSkip?: () => void;
}

/** 우측 "추가된 행사/장소" 패널과 그 아래 제출·건너뛰기 버튼. */
function DesktopSelectedPanel({
  title,
  emptyMessage,
  isEmpty,
  onRemoveAll,
  children,
  submitLabel,
  isSubmitDisabled,
  onSubmit,
  skipLabel,
  onSkip,
}: DesktopSelectedPanelProps) {
  return (
    <aside className="flex w-full flex-col gap-[16px]">
      <section
        aria-labelledby="selected-items-title"
        className="bg-background flex flex-col rounded-[24px] p-[16px]"
        style={{ height: PANEL_HEIGHT }}
      >
        <div className="flex shrink-0 items-center justify-between px-[8px] py-[8px]">
          <h2
            id="selected-items-title"
            className="text-[20px] font-semibold text-black"
          >
            {title}
          </h2>
          <button
            type="button"
            disabled={isEmpty}
            onClick={onRemoveAll}
            className="text-main-5 text-[14px] font-medium disabled:cursor-default disabled:opacity-40"
          >
            전체 삭제
          </button>
        </div>

        {isEmpty ? (
          <p className="text-gray-5 flex flex-1 items-center justify-center text-[16px] font-medium">
            {emptyMessage}
          </p>
        ) : (
          <ul className="scrollbar-hide mt-[8px] flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto">
            {children}
          </ul>
        )}
      </section>

      <button
        type="button"
        disabled={isSubmitDisabled}
        onClick={onSubmit}
        className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 w-full rounded-[12px] py-[16px] text-[18px] font-semibold text-white"
      >
        {submitLabel}
      </button>

      {skipLabel && onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="text-main-5 w-full text-[18px] font-semibold"
        >
          {skipLabel}
        </button>
      ) : null}
    </aside>
  );
}

export default DesktopSelectedPanel;
