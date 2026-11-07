import type {
  CourseItem,
  CreateLocalRecommendationRequest,
  OperatingDay,
  TimeFromPrevious,
} from '../../../apis/localRecommendations';
import type { UpdateCourseRequest } from '../../../apis/courses';
import { FORM_DURATION_TO_DURATION_TYPE } from '../course-basic-info/constants/options.ts';
import type { CourseBasicInfoValues } from '../course-basic-info/schema';
import {
  getTotalDaysForDuration,
  isTotalDaysValidForDuration,
} from '../../../utils/courseDetail.ts';
import type { LocalRecommendationDraft } from '../../../store/localRecommendation.store';
import type { VisitEvent } from './constants';
import type { VisitEventTravelData } from './useVisitEventTravelData';

/** 생성·수정 요청이 공유하는, 값이 반드시 있어야 하는 필드들. */
type CourseCommonFields = Required<
  Pick<
    UpdateCourseRequest,
    | 'title'
    | 'description'
    | 'durationType'
    | 'totalDays'
    | 'transportType'
    | 'companionType'
    | 'monthStart'
    | 'monthEnd'
    | 'thumbnailKey'
    | 'hashtagIds'
    | 'courseItems'
  >
>;

const TRANSPORT_TYPE_MAP: Record<
  CourseBasicInfoValues['transport'],
  CreateLocalRecommendationRequest['transportType']
> = {
  walking: 'WALK',
  car: 'CAR',
};

const COMPANION_TYPE_MAP: Record<
  CourseBasicInfoValues['companion'],
  CreateLocalRecommendationRequest['companionType']
> = {
  solo: 'SOLO',
  friends: 'FRIEND',
  couple: 'COUPLE',
  family: 'FAMILY',
  pet: 'PET',
};

function toNullableAddress(address: string | null | undefined): string | null {
  const trimmedAddress = address?.trim() ?? '';

  return trimmedAddress || null;
}

function normalizeOperatingDaysForStorage(
  operatingDays: readonly OperatingDay[]
): OperatingDay[] {
  return operatingDays.map((operatingDay) => ({
    ...operatingDay,
    closeTime:
      operatingDay.closeTime === '24:00' ? '23:59' : operatingDay.closeTime,
  }));
}

/**
 * 일차별로 묶인 방문 일정을 요청 아이템으로 편다. order는 일차마다 1부터 다시
 * 시작하고, 각 일차의 첫 항목에는 이동 시간을 보내지 않는다(서버 규칙).
 */
export function buildCourseItemsFromVisitEvents(
  visitEventsByDay: readonly (readonly VisitEvent[])[],
  travelData?: VisitEventTravelData
): CourseItem[] {
  return visitEventsByDay.flatMap((dayEvents, dayIndex) =>
    dayEvents.map((event, index) => {
      const day = dayIndex + 1;
      const order = index + 1;
      // 각 일차의 첫 항목은 비교할 이전 항목이 없어 timesFromPrevious를 보내지 않는다.
      const timesFromPrevious: TimeFromPrevious[] | undefined =
        order >= 2
          ? travelData?.timesFromPreviousByEventId.get(event.id)
          : undefined;

      if (event.kind === 'PLACE') {
        const operatingDays = travelData?.operatingDaysByEventId.get(event.id);

        return {
          day,
          order,
          type: 'PLACE',
          externalPlaceId: event.externalPlaceId,
          // 라이브 스펙에서 선택 필드다. 모르는 값(수정 진입 시 상세 조회에
          // 없어 빈 문자열로 채워진 경우)을 그대로 보내면 서버가 기존 값을
          // 빈 값으로 덮어쓸 위험이 있어, 실제로 아는 경우에만 필드를 넣는다.
          ...(event.categoryGroupCode
            ? { categoryGroupCode: event.categoryGroupCode }
            : {}),
          name: event.name,
          roadAddress: toNullableAddress(event.roadAddress),
          lotAddress: toNullableAddress(event.lotAddress),
          latitude: event.latitude,
          longitude: event.longitude,
          imageKey: event.imageKey,
          ...(operatingDays && operatingDays.length > 0
            ? { operatingDays: normalizeOperatingDaysForStorage(operatingDays) }
            : {}),
          ...(timesFromPrevious && timesFromPrevious.length > 0
            ? { timesFromPrevious }
            : {}),
        };
      }

      return {
        day,
        order,
        type: 'CONTENT',
        contentId: event.contentId,
        ...(timesFromPrevious && timesFromPrevious.length > 0
          ? { timesFromPrevious }
          : {}),
      };
    })
  );
}

/** 서버가 거절할 조건(COURSE4002/4004/4009 등)을 미리 걸러 메시지로 바꾼다. */
export function getCourseRequestValidationError(
  draft: LocalRecommendationDraft,
  visitEventsByDay: readonly (readonly VisitEvent[])[]
): string | null {
  // 수정 흐름은 지역 선택을 건너뛴다 — 라이브 스펙에 지역 수정 필드 자체가
  // 없어(CourseUpdateRequest) 애초에 바꿀 방법이 없다.
  if (!draft.editingCourseId && !draft.neighborhood) {
    return '지역 선택 단계에서 지역을 선택해 주세요.';
  }
  if (!draft.basicInfo)
    return '기본 정보 입력 단계에서 코스 정보를 입력해 주세요.';
  if (!draft.coverImageKey) return '대표 사진을 등록해 주세요.';
  if (draft.hashtagIds.length === 0) return '키워드를 하나 이상 선택해 주세요.';

  const { duration, transport, companion } = draft.basicInfo;
  const durationType = FORM_DURATION_TO_DURATION_TYPE[duration];
  if (
    !durationType ||
    !TRANSPORT_TYPE_MAP[transport] ||
    !COMPANION_TYPE_MAP[companion]
  ) {
    return '기본 정보의 여행 기간, 이동 수단, 동행 정보를 다시 선택해 주세요.';
  }

  const totalDays = getTotalDaysForDuration(durationType, draft.totalDays);
  if (!isTotalDaysValidForDuration(durationType, totalDays)) {
    return '여행 기간과 일차 수가 맞지 않아요. 기간을 다시 선택해 주세요.';
  }
  if (visitEventsByDay.length !== totalDays) {
    return `${totalDays}일차까지 일정을 모두 구성해 주세요.`;
  }

  // 서버는 빈 일차도, 행사만 있는 일차도 받지 않는다(COURSE4002).
  const dayWithoutPlace = visitEventsByDay.findIndex(
    (dayEvents) => !dayEvents.some((event) => event.kind === 'PLACE')
  );
  if (dayWithoutPlace >= 0) {
    return `${dayWithoutPlace + 1}일차에 장소를 하나 이상 추가해 주세요.`;
  }

  const places = visitEventsByDay
    .flat()
    .flatMap((event) => (event.kind === 'PLACE' ? [event] : []));
  if (
    places.some(
      (place) => !place.roadAddress?.trim() && !place.lotAddress?.trim()
    )
  ) {
    return '장소의 도로명 주소 또는 지번 주소를 입력해 주세요.';
  }
  // 우리동네 코스는 장소마다 사진이 필수다(COURSE4009).
  if (places.some((place) => !place.imageKey)) {
    return '각 장소에 사진을 등록해 주세요.';
  }

  return null;
}

/** 생성/수정 요청이 공유하는 필드 — 차이는 regionId(생성만 있음) 하나뿐이다. */
function buildCommonCourseFields(
  draft: LocalRecommendationDraft,
  visitEventsByDay: readonly (readonly VisitEvent[])[],
  travelData: VisitEventTravelData | undefined
): CourseCommonFields | null {
  const { basicInfo, coverImageKey } = draft;

  if (getCourseRequestValidationError(draft, visitEventsByDay)) {
    return null;
  }

  if (!basicInfo || !coverImageKey) {
    return null;
  }

  const durationType = FORM_DURATION_TO_DURATION_TYPE[basicInfo.duration];
  const transportType = TRANSPORT_TYPE_MAP[basicInfo.transport];
  const companionType = COMPANION_TYPE_MAP[basicInfo.companion];

  if (!durationType || !transportType || !companionType) {
    return null;
  }

  return {
    title: basicInfo.courseName,
    description: basicInfo.summary,
    durationType,
    totalDays: getTotalDaysForDuration(durationType, draft.totalDays),
    transportType,
    companionType,
    monthStart: Number(basicInfo.visitStartMonth),
    monthEnd: Number(basicInfo.visitEndMonth),
    thumbnailKey: coverImageKey,
    hashtagIds: draft.hashtagIds,
    courseItems: buildCourseItemsFromVisitEvents(visitEventsByDay, travelData),
  };
}

export function buildCourseRequest(
  draft: LocalRecommendationDraft,
  visitEventsByDay: readonly (readonly VisitEvent[])[],
  travelData: VisitEventTravelData | undefined,
  routeImageKey: string
): CreateLocalRecommendationRequest | null {
  const { neighborhood } = draft;

  if (!neighborhood) {
    return null;
  }

  const common = buildCommonCourseFields(draft, visitEventsByDay, travelData);

  if (!common) {
    return null;
  }

  return { ...common, regionId: neighborhood.id, routeImageKey };
}

/**
 * 수정 요청은 지역을 바꿀 수 없어(라이브 CourseUpdateRequest에 regionId
 * 필드 자체가 없다) neighborhood 없이 페이로드를 만든다.
 */
export function buildLocalCourseUpdateRequest(
  draft: LocalRecommendationDraft,
  visitEventsByDay: readonly (readonly VisitEvent[])[],
  travelData: VisitEventTravelData | undefined,
  routeImageKey?: string
): UpdateCourseRequest | null {
  const common = buildCommonCourseFields(draft, visitEventsByDay, travelData);

  return common
    ? {
        ...common,
        ...(routeImageKey ? { routeImageKey } : {}),
      }
    : null;
}
