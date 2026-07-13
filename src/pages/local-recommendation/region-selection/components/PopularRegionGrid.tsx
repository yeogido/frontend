import type { Neighborhood, PopularRegion } from '../types';

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
  return (
    <section className="mt-8" aria-labelledby="popular-region-heading">
      <h3 id="popular-region-heading" className="text-base font-bold">
        인기 지역
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
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
              className="group relative aspect-[4/3] min-w-0 overflow-hidden rounded-xl text-left"
            >
              <img
                src={region.image}
                alt={region.imageAlt}
                className="size-full object-cover transition-transform duration-200 group-active:scale-105"
              />
              <span className="absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-transparent" />
              <span className="text-pure-white absolute right-3 bottom-3 left-3">
                <span className="block text-sm font-bold">
                  {neighborhood.district}
                </span>
                <span className="mt-0.5 block text-[11px] opacity-90">
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
