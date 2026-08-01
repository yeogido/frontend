import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import type { Region } from '../../../../types/region.type';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 32;
const HEADING_SIZE = 16;
const GRID_MARGIN_TOP = 12;
const GRID_GAP = 12;
const CARD_RADIUS = 12;
const CARD_TEXT_INSET = 12;
const CARD_NAME_SIZE = 14;

interface PopularRegionGridProps {
  regions: readonly Region[];
  onSelect: (region: Region) => void;
}

function PopularRegionGrid({ regions, onSelect }: PopularRegionGridProps) {
  const scale = useGlobalScale();

  return (
    <section
      aria-labelledby="popular-region-heading"
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
    >
      <h3
        id="popular-region-heading"
        className="font-bold"
        style={{ fontSize: HEADING_SIZE * scale }}
      >
        인기 지역
      </h3>
      <div
        className="grid grid-cols-2"
        style={{
          marginTop: GRID_MARGIN_TOP * scale,
          gap: GRID_GAP * scale,
        }}
      >
        {regions.map((region) => (
          <button
            key={region.regionId}
            type="button"
            onClick={() => onSelect(region)}
            className="group relative aspect-[4/3] min-w-0 overflow-hidden text-left"
            style={{ borderRadius: CARD_RADIUS * scale }}
          >
            <img
              src={region.imageUrl}
              alt={`${region.name} 풍경`}
              className="size-full object-cover transition-transform duration-200 group-active:scale-105"
            />
            <span className="absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-transparent" />
            <span
              className="text-pure-white absolute font-bold"
              style={{
                right: CARD_TEXT_INSET * scale,
                bottom: CARD_TEXT_INSET * scale,
                left: CARD_TEXT_INSET * scale,
                fontSize: CARD_NAME_SIZE * scale,
              }}
            >
              {region.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default PopularRegionGrid;
