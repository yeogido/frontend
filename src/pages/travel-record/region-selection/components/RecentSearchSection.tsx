import closeRounded from '../../../../assets/icons/close-rounded.svg';

interface RecentSearchSectionProps {
  searches: readonly string[];
  onClear: () => void;
  onRemove: (index: number) => void;
  onSelect: (keyword: string) => void;
}

function RecentSearchSection({
  searches,
  onClear,
  onRemove,
  onSelect,
}: RecentSearchSectionProps) {
  const hasSearches = searches.length > 0;

  return (
    <section
      aria-label="최근 검색"
      className="mt-8 flex w-full shrink-0 flex-col"
    >
      <div className="flex items-start justify-between">
        <h2 className="text-[16px] leading-[19px] font-semibold text-black">
          최근 검색
        </h2>
        <button
          type="button"
          onClick={onClear}
          disabled={!hasSearches}
          aria-hidden={!hasSearches}
          className={`text-gray-4 pt-[3px] text-[12px] leading-[14px] font-normal ${
            hasSearches ? '' : 'invisible'
          }`}
        >
          전체 삭제
        </button>
      </div>

      <div className="mt-3 flex h-8 gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {searches.map((search, index) => (
          <div
            key={`${search}-${index}`}
            className="border-gray-2 bg-pure-white text-gray-4 flex h-8 min-w-[65px] shrink-0 items-center gap-1 rounded-full border pt-2 pr-2.5 pb-2 pl-3.5 text-[12px] leading-normal font-medium"
          >
            <button
              type="button"
              onClick={() => onSelect(search)}
              className="text-gray-4 min-w-0 text-[12px] leading-normal font-medium"
            >
              {search}
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`${search} 최근 검색어 삭제`}
              className="h-4 w-4 shrink-0"
            >
              <img src={closeRounded} alt="" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentSearchSection;
