import type { ReactNode } from 'react';
import { IoChevronBack } from 'react-icons/io5';

import { SearchBar } from '../../../components/common';

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
  return (
    <div className="bg-background min-h-dvh w-full">
      <main className="mx-auto min-h-dvh w-full max-w-[500px] bg-white px-6 pt-12 pb-[32dvh]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          className="text-gray-5 mb-4 -ml-2 flex h-8 w-8 items-center justify-center"
        >
          <IoChevronBack aria-hidden="true" className="text-3xl" />
        </button>

        <h1 className="text-[30px] leading-[1.28] font-bold tracking-[-0.02em] text-black">
          {title}
        </h1>

        <p className="text-gray-5 mt-3 text-sm leading-5">{description}</p>

        <SearchBar
          className="mt-8 max-w-none [&:has(input:placeholder-shown)_[role=listbox]]:hidden"
          placeholder={searchPlaceholder}
          label={searchLabel}
          suggestions={searchSuggestions}
          onSearch={onSearchChange}
        />

        <section className="mt-[22px]" aria-labelledby="selection-results-title">
          <h2
            id="selection-results-title"
            className="text-base leading-5 font-semibold text-black"
          >
            검색 결과
          </h2>

          <div className="mt-3 flex flex-col gap-4">
            {items.map((item) =>
              renderItem(
                item,
                selectedItemIds.has(getItemId(item)),
                onItemAdd
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default SelectionPageLayout;
