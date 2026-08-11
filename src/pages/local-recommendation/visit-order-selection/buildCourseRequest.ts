import type {
  CourseItem,
  CreateLocalRecommendationRequest,
  OperatingDay,
  TimeFromPrevious,
} from '../../../apis/localRecommendations';
import type { UpdateCourseRequest } from '../../../apis/courses';
import type { CourseBasicInfoValues } from '../course-basic-info/schema';
import type { LocalRecommendationDraft } from '../../../store/localRecommendation.store';
import type { VisitEvent } from './constants';
import type { VisitEventTravelData } from './useVisitEventTravelData';

const DURATION_TYPE_MAP: Record<
  CourseBasicInfoValues['duration'],
  CreateLocalRecommendationRequest['durationType']
> = {
  'day-trip': 'DAY_TRIP',
  '1-night-2-days': 'ONE_NIGHT',
  '2-nights-3-days': 'TWO_NIGHT',
  '3-nights-or-more': 'THREE_PLUS',
};

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

function toNullableAddress(address: string): string | null {
  const trimmedAddress = address.trim();

  return trimmedAddress || null;
}

function normalizeOperatingDaysForStorage(
  operatingDays: readonly OperatingDay[]
): OperatingDay[] {
  return operatingDays.map((operatingDay) => ({
    ...operatingDay,
    closeTime:
      operatingDay.closeTime === '24:00'
        ? '23:59'
        : operatingDay.closeTime,
  }));
}

export function buildCourseItemsFromVisitEvents(
  visitEvents: readonly VisitEvent[],
  travelData?: VisitEventTravelData
): CourseItem[] {
  return visitEvents.map((event, index) => {
    const order = index + 1;
    // 첫 번째 아이템은 비교할 이전 아이템이 없어 timesFromPrevious를 보내지 않는다.
    const timesFromPrevious: TimeFromPrevious[] | undefined =
      order >= 2
        ? travelData?.timesFromPreviousByEventId.get(event.id)
        : undefined;

    if (event.kind === 'PLACE') {
      const operatingDays = travelData?.operatingDaysByEventId.get(event.id);

      return {
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
      order,
      type: 'CONTENT',
      contentId: event.contentId,
      ...(timesFromPrevious && timesFromPrevious.length > 0
        ? { timesFromPrevious }
        : {}),
    };
  });
}

export function getCourseRequestValidationError(
  draft: LocalRecommendationDraft,
  visitEvents: readonly VisitEvent[]
): string | null {
  // 수정 흐름은 지역 선택을 건너뛴다 — 라이브 스펙에 지역 수정 필드 자체가
  // 없어(CourseUpdateRequest) 애초에 바꿀 방법이 없다.
  if (!draft.editingCourseId && !draft.neighborhood) {
    return '지역 선택 단계에서 지역을 선택해 주세요.';
  }
  if (!draft.basicInfo)
    return '기본 정보 입력 단계에서 코스 정보를 입력해 주세요.';
  if (!draft.coverImageKey) return '대표 사진을 등록해 주세요.';
  if (visitEvents.length === 0)
    return '방문할 장소 또는 행사를 하나 이상 추가해 주세요.';
  if (!visitEvents.some((event) => event.kind === 'PLACE')) {
    return '코스에는 장소를 하나 이상 추가해 주세요.';
  }
  if (
    visitEvents.some(
      (event) =>
        event.kind === 'PLACE' &&
        !event.roadAddress.trim() &&
        !event.lotAddress.trim()
    )
  ) {
    return '장소의 도로명 주소 또는 지번 주소를 입력해 주세요.';
  }

  const { duration, transport, companion } = draft.basicInfo;
  if (
    !DURATION_TYPE_MAP[duration] ||
    !TRANSPORT_TYPE_MAP[transport] ||
    !COMPANION_TYPE_MAP[companion]
  ) {
    return '기본 정보의 여행 기간, 이동 수단, 동행 정보를 다시 선택해 주세요.';
  }

  return null;
}

/** 생성/수정 요청이 공유하는 필드 — 차이는 regionId(생성만 있음) 하나뿐이다. */
function buildCommonCourseFields(
  draft: LocalRecommendationDraft,
  visitEvents: readonly VisitEvent[],
  travelData?: VisitEventTravelData
): UpdateCourseRequest | null {
  const { basicInfo, coverImageKey } = draft;

  if (getCourseRequestValidationError(draft, visitEvents)) {
    return null;
  }

  if (!basicInfo || !coverImageKey) {
    return null;
  }

  const durationType = DURATION_TYPE_MAP[basicInfo.duration];
  const transportType = TRANSPORT_TYPE_MAP[basicInfo.transport];
  const companionType = COMPANION_TYPE_MAP[basicInfo.companion];

  if (!durationType || !transportType || !companionType) {
    return null;
  }

  return {
    title: basicInfo.courseName,
    description: basicInfo.summary,
    durationType,
    transportType,
    companionType,
    monthStart: Number(basicInfo.visitStartMonth),
    monthEnd: Number(basicInfo.visitEndMonth),
    thumbnailKey: coverImageKey,
    hashtagIds: draft.hashtagIds,
    courseItems: buildCourseItemsFromVisitEvents(visitEvents, travelData),
  };
}

export function buildCourseRequest(
  draft: LocalRecommendationDraft,
  visitEvents: readonly VisitEvent[],
  travelData: VisitEventTravelData | undefined,
  routeImageKey: string
): CreateLocalRecommendationRequest | null {
  const { neighborhood } = draft;

  if (!neighborhood) {
    return null;
  }

  const common = buildCommonCourseFields(draft, visitEvents, travelData);

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
  visitEvents: readonly VisitEvent[],
  travelData?: VisitEventTravelData
): UpdateCourseRequest | null {
  return buildCommonCourseFields(draft, visitEvents, travelData);
}
