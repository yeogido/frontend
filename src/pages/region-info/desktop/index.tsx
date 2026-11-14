import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { DesktopPageShell } from '../../../components/layout/desktop';
import DesktopFilterDropdown from '../../../components/layout/desktop/DesktopFilterDropdown';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useCourses } from '../../../hooks/useCourses';
import { useDistanceSortCoordinates } from '../../../hooks/useDistanceSortCoordinates';
import { useRegion } from '../../../hooks/useRegions';
import { toCourseCardProps } from '../../../utils/courseCard';
import { getExplicitRegionId } from '../../../utils/regionSearch';
import { buildCourseDetailPath } from '../../../utils/routes';
import HomeCourseCard from '../../home/desktop/HomeCourseCard';
import HomeSectionHeader from '../../home/desktop/HomeSectionHeader';
import { yeogidoCourseFilterGroups } from '../../yeogido-course/constants/filters';
import useYeogidoCourseFilters from '../../yeogido-course/hooks/useYeogidoCourseFilters';
import { toCourseFilterParams } from '../../yeogido-course/utils/filterParams';
import { useResolvedRegion } from '../hooks/useResolvedRegion';
import RegionFestivalSection from './RegionFestivalSection';
import RegionPlaceSection from './RegionPlaceSection';

// Figma 1440 데스크톱 시안(6364:54980 지역 선택 결과) 기준 리터럴 px.
const CONTENT_WIDTH = 1048;
const COURSE_COUNT = 8;
const SKELETON_COUNT = 4;
const filterLabels = {
  transport: '이동 수단',
  duration: '여행 기간',
  companion: '동행',
  sort: '코스 정렬',
};

/** 데스크톱 지역 결과 — 한 지역의 여기도 코스와 진행 중인 행사를 모아 보여준다. */
function RegionInfoDesktopPage() {
  const { region } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { selectedFilters, handleFilterSelect } = useYeogidoCourseFilters();
  const { coordinates, status, requestCoordinates } =
    useDistanceSortCoordinates();
  const isDistanceSort = selectedFilters.sort === '거리순';

  const {
    regionId,
    isPending: isRegionIdPending,
    isError: isRegionNotFound,
  } = useResolvedRegion(region, getExplicitRegionId(location.state));
  const { data: regionDetail, isPending: isRegionDetailPending } =
    useRegion(regionId);

  const isRegionLoading =
    isRegionIdPending || (regionId !== undefined && isRegionDetailPending);
  const regionName = regionDetail?.name ?? region ?? '';
  // 시안(6364:54980)은 "부산"처럼 짧은 이름으로 제목을 보여준다.
  const displayName = regionName;

  // regionId를 못 찾은 지역은 지역명을 키워드로 대신 검색한다.
  const {
    data,
    isPending: isCoursesPending,
    isError: isCoursesError,
    refetch,
  } = useCourses(
    {
      courseType: 'OFFICIAL',
      regionId,
      keyword: regionId === undefined ? regionName : undefined,
      ...toCourseFilterParams(selectedFilters),
      latitude: isDistanceSort ? coordinates?.latitude : undefined,
      longitude: isDistanceSort ? coordinates?.longitude : undefined,
      size: COURSE_COUNT,
    },
    {
      enabled:
        !isRegionLoading &&
        !isRegionNotFound &&
        (!isDistanceSort || status === 'ready' || status === 'failed'),
    }
  );
  const courses = (data?.pages[0]?.items ?? [])
    .slice(0, COURSE_COUNT)
    .map(toCourseCardProps);
  const courseSearchPath = `/yeogido-course/search?region=${encodeURIComponent(regionName)}${
    regionId === undefined ? '' : `&regionId=${regionId}`
  }`;

  if (!isRegionLoading && isRegionNotFound) {
    return (
      <DesktopPageShell contentWidth={CONTENT_WIDTH}>
        <p
          role="alert"
          className="text-gray-4 py-[96px] text-center text-[16px]"
        >
          지역 정보를 찾을 수 없습니다.
        </p>
      </DesktopPageShell>
    );
  }

  return (
    <DesktopPageShell contentWidth={CONTENT_WIDTH}>
      <div className="flex flex-col gap-[64px]">
        <header className="flex flex-col gap-[8px]">
          <h1 className="text-[32px] font-semibold text-black">
            {displayName}의 코스와 장소
          </h1>
          <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
            {regionDetail?.description ??
              `${displayName}의 코스와 장소를 한번에 확인해보세요.`}
          </p>
        </header>

        <section
          aria-label={`${displayName} 여기도 코스`}
          className="flex flex-col gap-[20px]"
        >
          <HomeSectionHeader
            title={`${displayName} 여기도 가볼까?`}
            onMoreClick={() => navigate(courseSearchPath)}
          />

          <div className="flex items-start justify-between">
            <div className="flex gap-[16px]">
              {yeogidoCourseFilterGroups
                .filter((group) => group.key !== 'sort')
                .map((group) => (
                  <DesktopFilterDropdown
                    key={group.key}
                    label={filterLabels[group.key]}
                    options={group.options}
                    value={selectedFilters[group.key]}
                    onChange={(option) => handleFilterSelect(group.key, option)}
                  />
                ))}
            </div>
            <DesktopFilterDropdown
              label={filterLabels.sort}
              options={yeogidoCourseFilterGroups[3].options}
              value={selectedFilters.sort}
              align="right"
              onChange={(option) => {
                handleFilterSelect('sort', option);
                if (option === '거리순') void requestCoordinates();
              }}
            />
          </div>

          {isCoursesError ? (
            <div className="py-[32px] text-center">
              <p className="text-main-5">코스를 불러오지 못했어요.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="border-gray-2 mt-[16px] rounded-full border px-[16px] py-[8px]"
              >
                다시 시도
              </button>
            </div>
          ) : null}

          {!isCoursesError &&
          !isRegionLoading &&
          !isCoursesPending &&
          courses.length === 0 ? (
            <p className="text-gray-4 py-[32px] text-center">
              아직 등록된 코스가 없어요.
            </p>
          ) : null}

          <div className="grid grid-cols-4 gap-x-[24px] gap-y-[48px]">
            {isRegionLoading || isCoursesPending
              ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <div
                    key={index}
                    aria-hidden="true"
                    className="bg-gray-2 h-[300px] animate-pulse rounded-[12px]"
                  />
                ))
              : courses.map((course) => (
                  <HomeCourseCard
                    key={course.id}
                    image={course.image}
                    title={course.title}
                    duration={course.duration}
                    courseType={course.courseType}
                    companion={course.companion}
                    tags={course.tags}
                    liked={getLiked(course.id, course.liked)}
                    onClick={() =>
                      navigate(buildCourseDetailPath('OFFICIAL', course.id))
                    }
                    onLikeClick={() =>
                      toggleLike(course.id, getLiked(course.id, course.liked))
                    }
                  />
                ))}
          </div>
        </section>

        <RegionFestivalSection
          title={`${displayName}에서 진행 중인 행사`}
          regionId={regionId}
          keyword={regionId === undefined ? regionName : undefined}
          enabled={!isRegionLoading}
          moreTo={`/festival/search?region=${encodeURIComponent(regionName)}`}
        />

        {regionId !== undefined ? (
          <RegionPlaceSection
            title={`${displayName}에서 이 곳은 어때요?`}
            regionId={regionId}
            enabled={!isRegionLoading}
            moreTo="/local-business"
          />
        ) : null}
      </div>
    </DesktopPageShell>
  );
}

export default RegionInfoDesktopPage;
