import closeRounded from '../../../../assets/icons/close-rounded.svg';

interface RecentRegionDesktopSectionProps {
  searches: readonly string[];
  onClear: () => void;
  onRemove: (index: number) => void;
  onSelect: (label: string) => void;
}

/** 최근 검색 칩 목록 (Figma 6336:86661). 하나도 없으면 섹션째 감춘다. */
function RecentRegionDesktopSection({
  searches,
  onClear,
  onRemove,
  onSelect,
}: RecentRegionDesktopSectionProps) {
  if (searches.length === 0) return null;

  return (
    <section aria-label="최근 검색" className="flex w-full flex-col gap-[16px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-black">최근 검색</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-gray-4 text-[14px]"
        >
          전체 삭제
        </button>
      </div>

      <ul className="flex flex-wrap gap-[12px]">
        {searches.map((search, index) => (
          <li
            key={search + '-' + index}
            className="bg-background flex h-[36px] items-center gap-[6px] rounded-full pr-[12px] pl-[16px] text-[14px] font-medium text-black"
          >
            <button type="button" onClick={() => onSelect(search)}>
              {search}
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={search + ' 최근 검색어 삭제'}
              className="size-[16px] shrink-0"
            >
              <img src={closeRounded} alt="" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecentRegionDesktopSection;
