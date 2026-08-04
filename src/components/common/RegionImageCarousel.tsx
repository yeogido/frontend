import { useGlobalScale } from '../../hooks/useGlobalScale';

const CAROUSEL_DESIGN_WIDTH = 342;
const ITEM_SIZE = 64;
const ITEM_GAP = 8;
const LABEL_SIZE = 14;

export interface RegionImageOption {
  id: string;
  name: string;
  imageSrc: string;
}

interface RegionImageCarouselProps<T extends RegionImageOption> {
  options: readonly T[];
  selectedId: string;
  ariaLabel: string;
  onSelect: (option: T) => void;
}

function RegionImageCarousel<T extends RegionImageOption>({
  options,
  selectedId,
  ariaLabel,
  onSelect,
}: RegionImageCarouselProps<T>) {
  const scale = useGlobalScale();

  return (
    <div
      className="flex touch-pan-x [scrollbar-width:none] items-center overflow-x-auto overflow-y-hidden overscroll-x-contain overscroll-y-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      role="list"
      aria-label={ariaLabel}
      style={{
        width: CAROUSEL_DESIGN_WIDTH * scale,
        height: ITEM_SIZE * scale,
        gap: ITEM_GAP * scale,
      }}
    >
      {options.map((option) => {
        const isSelected = selectedId === option.id;

        return (
          <div
            key={option.id}
            role="listitem"
            className="flex-none"
            style={{
              width: ITEM_SIZE * scale,
              height: ITEM_SIZE * scale,
            }}
          >
            <button
              type="button"
              aria-pressed={isSelected}
              aria-label={`${option.name} 선택`}
              onClick={() => onSelect(option)}
              className="bg-gray-2 focus-visible:ring-main-5 relative h-full w-full overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-inset"
            >
              <img
                src={option.imageSrc}
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
              <span
                className="text-pure-white absolute inset-0 flex items-center justify-center leading-none font-medium"
                style={{ fontSize: LABEL_SIZE * scale }}
              >
                {option.name}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default RegionImageCarousel;
