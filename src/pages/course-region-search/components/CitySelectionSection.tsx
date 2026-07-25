import { RegionImageCarousel } from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import type { CityOption } from '../types';

const SECTION_MARGIN_TOP = 32;

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
  const scale = useGlobalScale();

  return (
    <section
      aria-label="도시 선택"
      className="relative z-[4] overflow-visible"
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
    >
      <RegionImageCarousel
        options={cities}
        selectedId={selectedCityId}
        ariaLabel="도시 목록"
        onSelect={onSelect}
      />
    </section>
  );
}

export default CitySelectionSection;
