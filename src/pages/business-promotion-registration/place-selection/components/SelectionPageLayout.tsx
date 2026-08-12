import type { ReactNode } from 'react';

import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import BackButton from './BackButton';

// Figma 390 디자인 기준 리터럴 px.
// local-recommendation의 SelectionPageLayout을 복사해 분리한 버전.
// 이 화면(Figma "장소 선택")은 검색창이 없어 SearchBar 관련 부분은 뺐다.
const PAGE_PADDING_TOP = 48;
const TITLE_FONT_SIZE = 30;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_FONT_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 20;
const RESULTS_MARGIN_TOP = 32;
const RESULTS_TITLE_FONT_SIZE = 16;
const RESULTS_TITLE_LINE_HEIGHT = 20;
const RESULTS_LIST_MARGIN_TOP = 12;
const RESULTS_LIST_GAP = 16;
const MINIMUM_SHEET_VIEWPORT_PERCENT = 36;
const RESULTS_BOTTOM_CLEARANCE = 16;

interface SelectionPageLayoutProps<T> {
  title: ReactNode;
  description: string;
  /** Figma 목업엔 별도 소제목이 없어 생략 가능하게 뒀다. */
  resultsTitle?: string;
  items: readonly T[];
  selectedItemIds: ReadonlySet<string>;
  getItemId: (item: T) => string;
  onItemAdd: (item: T) => void;
  onBack: () => void;
  renderItem: (
    item: T,
    isSelected: boolean,
    onItemAdd: (item: T) => void
  ) => ReactNode;
  /** Optional loading/error/empty message shown above the results list. */
  statusMessage?: ReactNode;
}

function SelectionPageLayout<T>({
  title,
  description,
  resultsTitle,
  items,
  selectedItemIds,
  getItemId,
  onItemAdd,
  onBack,
  renderItem,
  statusMessage,
}: SelectionPageLayoutProps<T>) {
  const scale = useGlobalScale();
  const titleSize = TITLE_FONT_SIZE * scale;
  const descriptionSize = DESCRIPTION_FONT_SIZE * scale;
  const resultsTitleSize = RESULTS_TITLE_FONT_SIZE * scale;

  return (
    <div className="bg-background min-h-dvh w-full">
      <ResponsivePageShell
        mode="standalone"
        topPadding={PAGE_PADDING_TOP}
        className="bg-white"
        style={{
          paddingBottom: `calc(${MINIMUM_SHEET_VIEWPORT_PERCENT}dvh + ${
            RESULTS_BOTTOM_CLEARANCE * scale
          }px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <BackButton onClick={onBack} />

        <h1
          className="leading-[1.28] font-bold tracking-[-0.02em] text-black"
          style={{ fontSize: titleSize }}
        >
          {title}
        </h1>

        <p
          className="text-gray-5"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: descriptionSize,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          {description}
        </p>

        <section
          style={{ marginTop: RESULTS_MARGIN_TOP * scale }}
          aria-labelledby={resultsTitle ? 'selection-results-title' : undefined}
        >
          {resultsTitle ? (
            <h2
              id="selection-results-title"
              className="font-semibold text-black"
              style={{
                fontSize: resultsTitleSize,
                lineHeight: `${RESULTS_TITLE_LINE_HEIGHT * scale}px`,
              }}
            >
              {resultsTitle}
            </h2>
          ) : null}

          {statusMessage ? (
            <div style={{ marginTop: RESULTS_LIST_MARGIN_TOP * scale }}>
              {statusMessage}
            </div>
          ) : null}

          <div
            className="flex flex-col"
            style={{
              marginTop: RESULTS_LIST_MARGIN_TOP * scale,
              gap: RESULTS_LIST_GAP * scale,
            }}
          >
            {items.map((item) =>
              renderItem(item, selectedItemIds.has(getItemId(item)), onItemAdd)
            )}
          </div>
        </section>
      </ResponsivePageShell>
    </div>
  );
}

export default SelectionPageLayout;
