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
  return (
    <section
      aria-label={parentDistrictName ? `${parentDistrictName} 구 선택` : '자치구 선택'}
      className="relative z-[3] mt-8 grid w-[342px] grid-cols-5 gap-x-4 gap-y-6"
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
              className={`min-w-0 text-right text-[14px] leading-normal whitespace-nowrap ${
                isSelected
                  ? 'text-gray-5 font-semibold'
                  : 'text-gray-4 font-normal'
              }`}
            >
              {district}
            </span>
          </button>
        );
      })}
    </section>
  );
}

export default DistrictSelectionSection;
