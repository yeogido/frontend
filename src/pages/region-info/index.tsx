import { useLocation, useParams } from 'react-router-dom';

import {
  REGION_INFO_ID_STATE_KEY,
  normalizeRegionName,
  regionCities,
} from '../../constants/regions';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useRegion } from '../../hooks/useRegions';
import RegionCourseSection from './components/RegionCourseSection';
import RegionFestivalSection from './components/RegionFestivalSection';
import RegionHeroSection from './components/RegionHeroSection';
import RegionReviewSection from './components/RegionReviewSection';
import { useResolvedRegion } from './hooks/useResolvedRegion';

const NOT_FOUND_PADDING_X = 24;
const NOT_FOUND_PADDING_Y = 96;
const NOT_FOUND_TEXT_SIZE = 14;

function getExplicitRegionId(state: unknown): number | undefined {
  if (
    typeof state === 'object' &&
    state !== null &&
    REGION_INFO_ID_STATE_KEY in state
  ) {
    const id = (state as Record<string, unknown>)[REGION_INFO_ID_STATE_KEY];

    if (typeof id === 'number') {
      return id;
    }
  }

  return undefined;
}

function RegionInfoPage() {
  const { region } = useParams();
  const location = useLocation();
  const scale = useGlobalScale();

  const {
    regionId,
    isPending: isRegionIdPending,
    isError: isRegionNotFound,
  } = useResolvedRegion(region, getExplicitRegionId(location.state));

  const {
    data: regionDetail,
    isPending: isRegionDetailPending,
    isError: isRegionDetailError,
    refetch: refetchRegionDetail,
  } = useRegion(regionId);

  const isRegionLoading =
    isRegionIdPending || (regionId !== undefined && isRegionDetailPending);
  const isHeroImageError = !isRegionLoading && isRegionDetailError;

  const regionName = regionDetail?.name ?? region ?? '';
  const regionInfo = {
    name: regionName,
    description: `${regionName}의 코스와 장소를 한번에 확인해보세요.`,
  };

  // 소상공인 추천 페이지의 지역 필터는 아직 시/도 단위 정적 id만 지원한다.
  // 상세 응답의 fullName(예: "서울특별시 강남구")에서 소속 시/도를 뽑아
  // 매칭하고, 못 찾으면(예: 처음 로딩 중) 기존 기본값(부산)으로 둔다.
  const provinceOfficialName = regionDetail?.fullName.split(' ')[0];
  const provinceShortName = provinceOfficialName
    ? normalizeRegionName(provinceOfficialName)
    : undefined;
  const regionSlug =
    regionCities.find((city) => city.name === provinceShortName)?.id ??
    'busan';

  if (!isRegionLoading && isRegionNotFound) {
    return (
      <main
        className="flex min-h-[60vh] items-center justify-center text-center"
        style={{
          paddingLeft: NOT_FOUND_PADDING_X * scale,
          paddingRight: NOT_FOUND_PADDING_X * scale,
          paddingTop: NOT_FOUND_PADDING_Y * scale,
          paddingBottom: NOT_FOUND_PADDING_Y * scale,
        }}
      >
        <p
          className="text-gray-4 font-medium"
          style={{ fontSize: NOT_FOUND_TEXT_SIZE * scale }}
        >
          지역 정보를 찾을 수 없습니다.
        </p>
      </main>
    );
  }

  return (
    <main className="pb-8">
      <RegionHeroSection
        regionInfo={regionInfo}
        heroImageUrl={regionDetail?.imageUrl ?? undefined}
        heroDescription={regionDetail?.description ?? undefined}
        isImageLoading={isRegionLoading}
        isImageError={isHeroImageError}
        onRetryImage={() => void refetchRegionDetail()}
      />

      <RegionCourseSection
        regionName={regionInfo.name}
        regionId={regionId}
        isRegionLoading={isRegionLoading}
      />

      <RegionFestivalSection
        regionName={regionInfo.name}
        regionId={regionId}
        isRegionLoading={isRegionLoading}
      />

      <RegionReviewSection
        regionName={regionInfo.name}
        regionSlug={regionSlug}
        regionId={regionId}
        isRegionLoading={isRegionLoading}
      />
    </main>
  );
}

export default RegionInfoPage;
