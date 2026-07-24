import type { TravelRecordRegion } from '../types';

interface PopularRegionGridProps {
  regions: readonly TravelRecordRegion[];
  selectedRegionId?: string;
  onSelect: (region: TravelRecordRegion) => void;
}

function PopularRegionGrid({
  regions,
  selectedRegionId,
  onSelect,
}: PopularRegionGridProps) {
  return (
    <section className="mt-8 flex shrink-0 flex-col gap-3">
      <h2 className="text-black text-[16px] leading-none font-semibold">
        인기 지역
      </h2>
      <div className="grid grid-cols-3 gap-[15px]">
        {regions.map((region) => (
          <button
            key={region.id}
            type="button"
            onClick={() => onSelect(region)}
            aria-pressed={selectedRegionId === region.id}
            className="relative h-[127px] overflow-hidden rounded-xl text-left"
          >
            <img
              src={region.imageSrc}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <span className="absolute inset-0 bg-black/30" />
            <span className="absolute top-[81px] left-3 max-w-[80px] truncate text-[14px] leading-none font-semibold text-[#f9f9f9]">
              {region.name}
            </span>
            <span className="absolute top-[100px] left-3 max-w-[80px] truncate text-[12px] leading-none text-[#f9f9f9]">
              {region.province}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default PopularRegionGrid;
