import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import type { Neighborhood, PopularRegion } from '../types';

// Figma 390 디자인 기준 리터럴 px
// 카드 자체는 grid-cols-2로 폭이 유동적이라 useScaleFrame을 쓰지 않고,
// 그리드의 고정 여백(margin/gap)과 섹션 제목만 스케일 처리한다.
const SECTION_MARGIN_TOP = 32;
const HEADING_SIZE = 16;
const GRID_MARGIN_TOP = 12;
const GRID_GAP = 12;
const CARD_RADIUS = 12;
const CARD_TEXT_INSET = 12;
const CARD_DISTRICT_SIZE = 14;
const CARD_META_MARGIN_TOP = 2;
const CARD_META_SIZE = 11;

interface PopularRegionGridProps {
  regions: PopularRegion[];
  neighborhoods: Neighborhood[];
  onSelect: (neighborhood: Neighborhood) => void;
}

function PopularRegionGrid({
  regions,
  neighborhoods,
  onSelect,
}: PopularRegionGridProps) {
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
        {regions.map((region) => {
          const neighborhood = neighborhoods.find(
            ({ id }) => id === region.neighborhoodId
          );

          if (!neighborhood) {
            return null;
          }

          return (
            <button
              key={region.neighborhoodId}
              type="button"
              onClick={() => onSelect(neighborhood)}
              className="group relative aspect-[4/3] min-w-0 overflow-hidden text-left"
              style={{ borderRadius: CARD_RADIUS * scale }}
            >
              <img
                src={region.image}
                alt={region.imageAlt}
                className="size-full object-cover transition-transform duration-200 group-active:scale-105"
              />
              <span className="absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-transparent" />
              <span
                className="text-pure-white absolute"
                style={{
                  right: CARD_TEXT_INSET * scale,
                  bottom: CARD_TEXT_INSET * scale,
                  left: CARD_TEXT_INSET * scale,
                }}
              >
                <span
                  className="block font-bold"
                  style={{
                    fontSize: CARD_DISTRICT_SIZE * scale,
                  }}
                >
                  {neighborhood.district}
                </span>
                <span
                  className="block opacity-90"
                  style={{
                    marginTop: CARD_META_MARGIN_TOP * scale,
                    fontSize: CARD_META_SIZE * scale,
                  }}
                >
                  {neighborhood.province} {neighborhood.city}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default PopularRegionGrid;
