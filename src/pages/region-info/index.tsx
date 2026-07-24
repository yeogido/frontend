import { useParams } from 'react-router-dom';

import RegionCourseSection from './components/RegionCourseSection';
import RegionFestivalSection from './components/RegionFestivalSection';
import RegionHeroSection from './components/RegionHeroSection';
import { regionInfoMap } from './constants/mock';

function RegionInfoPage() {
  const { region } = useParams();

  const regionInfo =
    region && regionInfoMap[region]
      ? regionInfoMap[region]
      : regionInfoMap.busan;

  return (
    <main className="pb-8">
      <RegionHeroSection regionInfo={regionInfo} />

      <RegionCourseSection
        regionName={regionInfo.name}
      />

      <RegionFestivalSection
        regionName={regionInfo.name}
      />
    </main>
  );
}

export default RegionInfoPage;