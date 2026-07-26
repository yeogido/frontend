import type { ReactNode } from 'react';
import { IoChevronBack } from 'react-icons/io5';

import { SearchBar } from '../../../components/common';
import ResponsivePageShell from '../../../components/layout/ResponsivePageShell';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 48;
const BACK_BUTTON_SIZE = 32;
const BACK_BUTTON_MARGIN_BOTTOM = 16;
const BACK_BUTTON_MARGIN_LEFT = -8;
const BACK_ICON_SIZE = 30;
const TITLE_FONT_SIZE = 30;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_FONT_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 20;
const SEARCH_MARGIN_TOP = 32;
const RESULTS_MARGIN_TOP = 22;
const RESULTS_TITLE_FONT_SIZE = 16;
const RESULTS_TITLE_LINE_HEIGHT = 20;
const RESULTS_LIST_MARGIN_TOP = 12;
const RESULTS_LIST_GAP = 16;
const MINIMUM_SHEET_VIEWPORT_PERCENT = 36;
const RESULTS_BOTTOM_CLEARANCE = 16;

interface SelectionPageLayoutProps<T> {
  title: ReactNode;
  description: string;
  searchPlaceholder: string;
  searchLabel: string;
  searchSuggestions: readonly string[];
  items: readonly T[];
  selectedItemIds: ReadonlySet<string>;
  getItemId: (item: T) => string;
  onSearchChange: (query: string) => void;
  onItemAdd: (item: T) => void;
  onBack: () => void;
  renderItem: (
    item: T,
    isSelected: boolean,
    onItemAdd: (item: T) => void
  ) => ReactNode;
}

function SelectionPageLayout<T>({
  title,
  description,
  searchPlaceholder,
  searchLabel,
  searchSuggestions,
  items,
  selectedItemIds,
  getItemId,
  onSearchChange,
  onItemAdd,
  onBack,
  renderItem,
}: SelectionPageLayoutProps<T>) {
  const scale = useGlobalScale();
  const backButtonSize = BACK_BUTTON_SIZE * scale;
  const scaledBackButtonSize = BACK_BUTTON_SIZE * scale;
  const backButtonMarginLeft =
    BACK_BUTTON_MARGIN_LEFT * scale -
    (backButtonSize - scaledBackButtonSize) / 2;
  const backButtonMarginBottom = Math.max(
    0,
    BACK_BUTTON_MARGIN_BOTTOM * scale - (backButtonSize - scaledBackButtonSize)
  );
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
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          className="text-gray-5 flex items-center justify-center"
          style={{
            width: backButtonSize,
            height: backButtonSize,
            marginBottom: backButtonMarginBottom,
            marginLeft: backButtonMarginLeft,
          }}
        >
          <IoChevronBack
            aria-hidden="true"
            style={{ fontSize: BACK_ICON_SIZE * scale }}
          />
        </button>

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

        <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
          <SearchBar
            className="max-w-none [&:has(input:placeholder-shown)_[role=listbox]]:hidden"
            placeholder={searchPlaceholder}
            label={searchLabel}
            suggestions={searchSuggestions}
            onSearch={onSearchChange}
          />
        </div>

        <section
          style={{ marginTop: RESULTS_MARGIN_TOP * scale }}
          aria-labelledby="selection-results-title"
        >
          <h2
            id="selection-results-title"
            className="font-semibold text-black"
            style={{
              fontSize: resultsTitleSize,
              lineHeight: `${
                RESULTS_TITLE_LINE_HEIGHT * scale}px`,
            }}
          >
            검색 결과
          </h2>

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
