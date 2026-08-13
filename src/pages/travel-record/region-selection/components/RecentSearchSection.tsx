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
  // 최근 검색이 하나도 없으면 제목과 '전체 삭제'만 남아 빈 자리가 생기므로
  // 섹션을 통째로 감춘다.
  if (searches.length === 0) {
    return null;
  }

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
          className="text-gray-4 pt-[3px] text-[12px] leading-[14px] font-normal"
        >
          전체 삭제
        </button>
      </div>

      <div className="mt-3 flex h-8 gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {searches.map((search, index) => (
          <div
            key={`${search}-${index}`}
            className="bg-[#f1f1f1] text-[#1c1c1c] flex h-8 min-w-[65px] shrink-0 items-center gap-1 rounded-full pt-2 pr-2.5 pb-2 pl-3.5 text-[12px] leading-normal font-medium"
          >
            <button
              type="button"
              onClick={() => onSelect(search)}
              className="text-[#1c1c1c] min-w-0 text-[12px] leading-normal font-medium"
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
