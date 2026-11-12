import type { ReactNode } from 'react';

import { DesktopPageShell } from '../../../components/layout/desktop';

// Figma 1440 데스크톱 시안(6336:89225): 본문 1040 = 좌 608 + 간격 72 + 우 360
const CONTENT_WIDTH = 1040;
const LEFT_COLUMN_WIDTH = 608;
const RIGHT_COLUMN_WIDTH = 360;

interface DesktopSelectionLayoutProps {
  title: ReactNode;
  description: string;
  /** 좌측 검색 입력. */
  search: ReactNode;
  /** 검색 결과 위에 보여줄 로딩/오류/빈 결과 안내. */
  statusMessage?: ReactNode;
  /** 검색 결과 줄들 — DesktopResultRow의 li들. */
  results: ReactNode;
  /** 우측 패널 — DesktopSelectedPanel. */
  panel: ReactNode;
  /** 제목 아래에 얹을 부가 요소(예: 사진 복구 안내). */
  notice?: ReactNode;
}

/**
 * 행사·장소 등록처럼 "왼쪽에서 검색해 오른쪽에 담는" 데스크톱 2단 화면.
 * 모바일은 아래에서 올라오는 시트였던 선택 목록이 여기서는 오른쪽 패널이다.
 */
function DesktopSelectionLayout({
  title,
  description,
  search,
  statusMessage,
  results,
  panel,
  notice,
}: DesktopSelectionLayoutProps) {
  return (
    <DesktopPageShell contentWidth={CONTENT_WIDTH}>
      <header className="flex flex-col gap-[6px]">
        <h1 className="text-[32px] font-semibold text-black">{title}</h1>
        <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
          {description}
        </p>
      </header>

      {notice ? <div className="mt-[16px]">{notice}</div> : null}

      <div className="mt-[24px] flex items-start justify-between gap-[72px]">
        <section
          className="min-w-0"
          style={{ width: LEFT_COLUMN_WIDTH }}
          aria-labelledby="selection-results-title"
        >
          {search}

          <h2
            id="selection-results-title"
            className="mt-[24px] text-[20px] font-semibold text-black"
          >
            검색 결과
          </h2>

          {statusMessage ? (
            <div className="mt-[16px]">{statusMessage}</div>
          ) : null}

          <ul className="mt-[16px] flex flex-col gap-[20px]">{results}</ul>
        </section>

        <div className="shrink-0" style={{ width: RIGHT_COLUMN_WIDTH }}>
          {panel}
        </div>
      </div>
    </DesktopPageShell>
  );
}

export default DesktopSelectionLayout;
