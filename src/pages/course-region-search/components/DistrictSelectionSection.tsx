import { useScaleFrame } from '../../../hooks/useScaleFrame';

const SECTION_DESIGN_WIDTH = 342;
const SECTION_MARGIN_TOP = 32;
const DISTRICT_GAP_X = 16;
const DISTRICT_GAP_Y = 24;
const DISTRICT_NAME_SIZE = 14;

interface DistrictSelectionSectionProps {
  districts: readonly string[];
  parentDistrictName?: string;
  selectedDistrict: string;
  onSelect: (district: string) => void;
}

function DistrictSelectionSection({
  districts,
  parentDistrictName,
  selectedDistrict,
  onSelect,
}: DistrictSelectionSectionProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(SECTION_DESIGN_WIDTH);

  return (
    <section
      ref={outerRef}
      aria-label={
        parentDistrictName ? `${parentDistrictName} 구 선택` : '자치구 선택'
      }
      className="relative z-[3] overflow-visible"
      style={{
        marginTop: SECTION_MARGIN_TOP * scale,
        height: scaledHeight,
      }}
    >
      <div
        ref={innerRef}
        className="grid grid-cols-5"
        style={{
          width: SECTION_DESIGN_WIDTH,
          columnGap: DISTRICT_GAP_X,
          rowGap: DISTRICT_GAP_Y,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {districts.map((district) => {
          const isSelected = selectedDistrict === district;

          return (
            <button
              key={district}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(district)}
              className="relative flex min-w-0 items-center justify-center rounded-full transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-5"
            >
              <span
                className={`min-w-0 text-right leading-normal whitespace-nowrap ${
                  isSelected
                    ? 'text-gray-5 font-semibold'
                    : 'text-gray-4 font-normal'
                }`}
                style={{ fontSize: DISTRICT_NAME_SIZE }}
              >
                {district}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default DistrictSelectionSection;
