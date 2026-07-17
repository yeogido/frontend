import type { CityOption } from '../types';

interface CitySelectionSectionProps {
  cities: readonly CityOption[];
  selectedCityId: string;
  onSelect: (city: CityOption) => void;
}

function CitySelectionSection({
  cities,
  selectedCityId,
  onSelect,
}: CitySelectionSectionProps) {
  return (
    <section
      aria-label="도시 선택"
      className="relative z-[4] mt-8 flex h-16 w-[342px]"
    >
      <div
        className="flex h-16 w-[342px] items-center gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label="도시 목록"
      >
        {cities.map((city) => {
          const isSelected = selectedCityId === city.id;

          return (
            <div key={city.id} role="listitem" className="h-16 w-16 flex-none">
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`${city.name} 선택`}
                onClick={() => onSelect(city)}
                className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-2 outline-none focus-visible:ring-2 focus-visible:ring-main-5 focus-visible:ring-offset-2"
              >
                <img
                  src={city.imageSrc}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-full ${
                    isSelected ? 'bg-main-5/55' : 'bg-black/30'
                  }`}
                />
                <span className="text-pure-white absolute inset-0 flex items-center justify-center text-[14px] leading-none font-medium">
                  {city.name}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CitySelectionSection;
