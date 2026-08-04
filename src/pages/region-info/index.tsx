import { useParams } from 'react-router-dom';

import { useRegions } from '../../hooks/useRegions';
import RegionCourseSection from './components/RegionCourseSection';
import RegionFestivalSection from './components/RegionFestivalSection';
import RegionHeroSection from './components/RegionHeroSection';
import { regionInfoMap } from './constants/mock';
import RegionReviewSection from './components/RegionReviewSection';

function RegionInfoPage() {
  const { region } = useParams();

  const isKnownRegion = Boolean(region && regionInfoMap[region]);
  const regionSlug = isKnownRegion ? (region as string) : 'busan';
  const regionInfo = regionInfoMap[regionSlug];

  const { data: regionsData, isPending: isRegionsPending } = useRegions();
  const regionId = regionsData?.regions.find(
    (candidate) => candidate.name === regionInfo.name
  )?.regionId;

  return (
    <main className="pb-8">
      <RegionHeroSection regionInfo={regionInfo} />

      <RegionCourseSection
        regionName={regionInfo.name}
        regionId={regionId}
        isRegionLoading={isRegionsPending}
      />

      <RegionFestivalSection
        regionName={regionInfo.name}
        regionId={regionId}
        isRegionLoading={isRegionsPending}
      />

      <RegionReviewSection
        regionName={regionInfo.name}
        regionSlug={regionSlug}
        regionId={regionId}
        isRegionLoading={isRegionsPending}
      />
    </main>
  );
}

export default RegionInfoPage;