import { RegionImageCarousel } from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import type { CityOption } from '../types';
import { getCourseRegionCityOptions } from '../utils/citySelection';
import { getCitySelectionMarginTop } from '../utils/layout';

interface CitySelectionSectionProps {
  cities: readonly CityOption[];
  hasRecentSearches: boolean;
  selectedCityId: string;
  onSelect: (city: CityOption) => void;
}

function CitySelectionSection({
  cities,
  hasRecentSearches,
  selectedCityId,
  onSelect,
}: CitySelectionSectionProps) {
  const scale = useGlobalScale();

  return (
    <section
      aria-label="도시 선택"
      className="relative z-[4] overflow-visible"
      style={{ marginTop: getCitySelectionMarginTop(hasRecentSearches) * scale }}
    >
      <RegionImageCarousel
        options={getCourseRegionCityOptions(cities)}
        selectedId={selectedCityId}
        ariaLabel="도시 목록"
        onSelect={onSelect}
      />
    </section>
  );
}

export default CitySelectionSection;
