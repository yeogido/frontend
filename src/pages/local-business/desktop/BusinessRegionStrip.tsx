import type { RegionImageOption } from '../../../components/common/RegionImageCarousel';

// Figma 1440 데스크톱 시안(6336:75105) 기준 리터럴 px.
const CIRCLE_SIZE = 128;

interface BusinessRegionStripProps {
  readonly options: readonly RegionImageOption[];
  readonly selectedId: string;
  readonly onSelect: (option: RegionImageOption) => void;
}

/**
 * 지역을 고르는 원형 사진 줄. 폭을 넘치면 가로로 스크롤한다.
 * 선택한 지역은 메인 색 테두리로 표시한다.
 */
function BusinessRegionStrip({
  options,
  selectedId,
  onSelect,
}: BusinessRegionStripProps) {
  return (
    <ul
      aria-label="지역 목록"
      className="flex [scrollbar-width:none] gap-[36px] overflow-x-auto p-[4px] [&::-webkit-scrollbar]:hidden"
    >
      {options.map((option) => {
        const isSelected = option.id === selectedId;

        return (
          <li key={option.id} className="shrink-0">
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(option)}
              style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
              className={`bg-gray-2 relative block overflow-hidden rounded-full ${
                isSelected ? 'ring-main-5 ring-4' : ''
              }`}
            >
              {option.imageSrc ? (
                <img
                  src={option.imageSrc}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <span
                className="absolute inset-0 bg-black/20"
                aria-hidden="true"
              />
              <span className="relative text-[24px] font-semibold text-white">
                {option.name}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default BusinessRegionStrip;
