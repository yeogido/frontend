// Figma 1440 데스크톱 시안(6336:86661) 기준 리터럴 px
const CARD_HEIGHT = 206;

interface PopularRegion {
  id: string;
  name: string;
  province: string;
  imageSrc?: string | null;
}

interface PopularRegionDesktopGridProps {
  regions: readonly PopularRegion[];
  selectedRegionId?: string;
  onSelect: (region: PopularRegion) => void;
}

/** 인기 지역 4열 카드 그리드. 고른 지역은 테두리로 표시한다. */
function PopularRegionDesktopGrid({
  regions,
  selectedRegionId,
  onSelect,
}: PopularRegionDesktopGridProps) {
  return (
    <section className="flex flex-col gap-[16px]">
      <h2 className="text-[20px] font-semibold text-black">인기 지역</h2>
      <div className="grid grid-cols-4 gap-[20px]">
        {regions.map((region) => {
          const isSelected = selectedRegionId === region.id;

          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelect(region)}
              aria-pressed={isSelected}
              className={
                'bg-gray-3 relative overflow-hidden rounded-[12px] text-left ' +
                (isSelected ? 'ring-main-5 ring-[3px]' : '')
              }
              style={{ height: CARD_HEIGHT }}
            >
              {region.imageSrc ? (
                <img
                  src={region.imageSrc}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              ) : null}
              <span className="absolute inset-0 bg-black/30" />
              <span className="absolute inset-x-[14px] bottom-[14px] flex flex-col gap-[4px] text-white">
                <span className="truncate text-[20px] font-semibold">
                  {region.name}
                </span>
                <span className="truncate text-[14px]">{region.province}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default PopularRegionDesktopGrid;
