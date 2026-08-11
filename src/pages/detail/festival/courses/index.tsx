import { useQueries } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { getCourseDetail } from '../../../../apis/courses';
import {
  ContentCard,
  ContentCardSkeleton,
  CourseFilterBar,
} from '../../../../components/common';
import { isExtendedTransportFilterLabel } from '../../../../constants/courseFilterLayout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useCourseLikeToggle } from '../../../../hooks/useCourseLikeToggle';
import { useDistanceSortCoordinates } from '../../../../hooks/useDistanceSortCoordinates';
import { useNavigateToCourseDetail } from '../../../../hooks/useCourses';
import { useCultureContentDetail } from '../../../../hooks/useCultureContentDetail';
import { isCourseNotFoundError } from '../../../../hooks/useReviews';
import { toContentTagIds } from '../../../../utils/contentTags';
import { festivalCoursesFilterGroups } from './constants/filters';
import useFestivalCoursesFilters from './hooks/useFestivalCoursesFilters';
import { mapFestivalRelatedCourses } from '../../mappers/cultureContentDetailMapper';
import type {
  CourseCompanionType,
  CourseDurationType,
  CourseTransportType,
} from '../../../../types/course.type';
import type { MapCoordinates } from '../../../../components/kakaomap/utils/kakaoMap';
import type { CourseDetailItem } from '../../../../apis/courses';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;
const FILTER_MARGIN_TOP = 15;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const MESSAGE_TEXT_SIZE = 13;

const SKELETON_ITEMS = [0, 1, 2, 3, 4, 5, 6, 7];

// 목록에서 걸러온 카드는 이미 한글 라벨(예: '도보' 대신 '뚜벅이')로
// 바뀌어 있어 필터 칩 라벨과 직접 비교할 수 없다 — 필터링은 항상 원본
// enum 값끼리 비교한다. 여기도 코스 검색 페이지들과 동일한 라벨↔enum
// 매핑 테이블(페이지마다 로컬로 둔다는 관례도 동일하게 따른다).
// 정렬은 거리순만 지원한다 — 상세 응답의 courses에는 좋아요 수·저장 수·
// 등록일 같은 다른 정렬 근거가 될 값이 아예 없고(코스 상세 조회 스펙에도
// 없음을 확인), 거리만 코스 상세의 첫 방문지 좌표로 클라이언트에서 계산할
// 수 있다. 나머지 정렬은 "이 행사를 포함한 코스만" 걸러 서버가 직접 정렬해
// 주는 API가 생기면 다시 추가한다.
const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function getDistanceKm(from: MapCoordinates, to: MapCoordinates) {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const centralAngle =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(centralAngle));
}

// 코스 상세의 첫 방문지를 "코스 위치"로 삼아 거리순의 기준점으로 쓴다 —
// 코스 자체는 좌표가 없고, 방문 순서(order)가 가장 앞선 지점이 코스를
// 대표하기 가장 자연스럽다.
function getFirstStopCoordinates(
  courseItems: CourseDetailItem[] | undefined
): MapCoordinates | null {
  if (!courseItems || courseItems.length === 0) return null;

  const firstStop = [...courseItems].sort((a, b) => a.order - b.order)[0];
  return { latitude: firstStop.latitude, longitude: firstStop.longitude };
}

const transportTypeByLabel: Record<string, CourseTransportType | undefined> = {
  도보: 'WALK',
  대중교통: 'PUBLIC',
  자차: 'CAR',
};

const durationTypeByLabel: Record<string, CourseDurationType | undefined> = {
  당일치기: 'DAY_TRIP',
  '1박 2일': 'ONE_NIGHT',
  '2박 3일': 'TWO_NIGHT',
  '3박 이상': 'THREE_PLUS',
};

const companionTypeByLabel: Record<string, CourseCompanionType | undefined> = {
  혼자: 'SOLO',
  친구와: 'FRIEND',
  연인과: 'COUPLE',
  가족과: 'FAMILY',
  반려동물과: 'PET',
};

function FestivalRelatedCoursesPage() {
  const { festivalId } = useParams<{ festivalId?: string }>();
  const contentId = Number(festivalId);
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { goToCourseDetail } = useNavigateToCourseDetail();

  const {
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
  } = useFestivalCoursesFilters();

  const isDistanceSortActive = selectedFilters.sort === '거리순';
  const userCoordinates = useDistanceSortCoordinates(isDistanceSortActive);

  const {
    data: content,
    isPending,
    isError,
  } = useCultureContentDetail(contentId);

  // 상세 응답의 courses에는 태그가 없어(다른 필드는 다 있다), 코스별
  // 상세를 따로 받아 태그를 채운다 — 전체 목록 기준으로 한 번만 조회해
  // 필터를 바꿔도 다시 요청하지 않는다. 행사에 연결된 코스가 나중에
  // 삭제돼도 행사 쪽 목록엔 남아 있을 수 있어(코스 상세 조회는
  // COURSE4041로 404), 그렇게 확인된 코스는 목록에서 아예 뺀다.
  const allCourseIds = (content?.courses ?? []).map(
    (course) => course.courseId
  );
  const courseDetailQueries = useQueries({
    queries: allCourseIds.map((courseId) => ({
      queryKey: ['courseDetail', courseId],
      queryFn: () => getCourseDetail(courseId),
      staleTime: 1000 * 60,
      // 삭제된 코스(COURSE4041)는 재시도해도 절대 성공하지 않는다 —
      // 기본 재시도(3회)를 두면 삭제 판정이 늦어지고 요청만 늘어난다.
      retry: (failureCount: number, error: unknown) =>
        !isCourseNotFoundError(error) && failureCount < 3,
    })),
  });
  const courseDetailQueryById = new Map(
    allCourseIds.map((courseId, index) => [
      courseId,
      courseDetailQueries[index],
    ])
  );
  // 코스 상세 조회가 끝나기 전에는 삭제 여부(deletedCourseIds)도, 태그도,
  // 거리도 아직 확정되지 않은 상태다 — 이 조회들이 끝나기 전까지는 목록을
  // 그리지 않고 스켈레톤을 유지해, 삭제된 코스가 잠깐 보였다 사라지거나
  // 태그/정렬이 늦게 반영되는 깜빡임을 막는다.
  const isCourseDetailsPending = courseDetailQueries.some(
    (query) => query.isPending
  );
  const isListLoading = isPending || isCourseDetailsPending;
  const deletedCourseIds = new Set(
    allCourseIds.filter((courseId) => {
      const query = courseDetailQueryById.get(courseId);
      return Boolean(query?.isError && isCourseNotFoundError(query.error));
    })
  );

  // 이 행사가 포함된 코스만 걸러 조회하는 API가 없어, 상세 응답에 이미
  // 다 내려오는 courses를 그대로 받아 클라이언트에서 필터링한다(별도
  // 페이지네이션 없음 — 원래 목록 자체가 전체 목록이다).
  const filteredCourses = (content?.courses ?? []).filter((course) => {
    if (deletedCourseIds.has(course.courseId)) return false;

    const transportOption = transportTypeByLabel[selectedFilters.transport];
    const durationOption = durationTypeByLabel[selectedFilters.duration];
    const companionOption = companionTypeByLabel[selectedFilters.companion];

    return (
      (!transportOption || course.transportType === transportOption) &&
      (!durationOption || course.durationType === durationOption) &&
      (!companionOption || course.companionType === companionOption)
    );
  });

  const coursesWithDistance = mapFestivalRelatedCourses(filteredCourses).map(
    (course) => {
      const detail = courseDetailQueryById.get(course.id)?.data;
      const stopCoordinates = getFirstStopCoordinates(detail?.courseItems);
      const distanceKm =
        userCoordinates && stopCoordinates
          ? getDistanceKm(userCoordinates, stopCoordinates)
          : null;

      return {
        ...course,
        tags: toContentTagIds(detail?.tags ?? []),
        distanceKm,
      };
    }
  );

  // 거리순일 때만 정렬한다 — 좌표를 아직 못 구했거나(위치 권한 대기 중)
  // 코스 상세를 아직 못 받아온 항목은 뒤로 보내되 목록에서 빼지는 않는다.
  const courses = isDistanceSortActive
    ? [...coursesWithDistance].sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      })
    : coursesWithDistance;

  const hasEmptyResult = !isListLoading && !isError && courses.length === 0;

  return (
    <section
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{
        paddingLeft: PAGE_PADDING_X * scale,
        paddingRight: PAGE_PADDING_X * scale,
        paddingTop: PAGE_PADDING_TOP * scale,
        paddingBottom: PAGE_PADDING_BOTTOM * scale,
      }}
    >
      <div>
        <h1
          className="font-semibold text-black"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          {content ? `'${content.title}'가 포함된 코스예요` : '포함된 코스'}
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          선택한 행사가 포함된 코스를 확인해 보세요
        </p>
      </div>

      <CourseFilterBar
        filterGroups={festivalCoursesFilterGroups}
        selectedFilters={selectedFilters}
        openFilterKey={openFilterKey}
        filterContainerRef={filterContainerRef}
        isExtendedTransport={isExtendedTransportFilterLabel(
          selectedFilters.transport
        )}
        marginTop={FILTER_MARGIN_TOP}
        onToggle={handleFilterToggle}
        onSelect={handleFilterSelect}
      />

      <div
        className="grid grid-cols-2"
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          columnGap: LIST_GAP * scale,
          rowGap: LIST_GAP * scale,
        }}
      >
        {isListLoading
          ? SKELETON_ITEMS.map((item) => (
              <ContentCardSkeleton
                key={item}
                className="w-full"
                imageClassName="aspect-[163/115] h-auto"
              />
            ))
          : courses.map((course) => (
              <ContentCard
                key={course.id}
                image={course.image}
                title={course.title}
                firstInfo={course.duration}
                secondInfo={course.courseType}
                thirdInfo={course.companion}
                tags={[...course.tags]}
                className="w-full"
                liked={getLiked(course.id, course.liked)}
                onClick={() => void goToCourseDetail(course.id)}
                onLikeClick={() =>
                  toggleLike(course.id, getLiked(course.id, course.liked))
                }
              />
            ))}
      </div>

      {hasEmptyResult ? (
        <p
          className="text-gray-4 text-center font-medium"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: MESSAGE_TEXT_SIZE * scale,
          }}
        >
          조건에 맞는 코스가 없습니다.
        </p>
      ) : null}

      {isError ? (
        <p
          className="text-main-5 text-center font-medium"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: MESSAGE_TEXT_SIZE * scale,
          }}
        >
          코스 목록을 불러오지 못했어요.
        </p>
      ) : null}
    </section>
  );
}

export default FestivalRelatedCoursesPage;
