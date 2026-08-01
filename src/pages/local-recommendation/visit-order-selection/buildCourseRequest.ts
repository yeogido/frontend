import type {
  CourseItem,
  CreateLocalRecommendationRequest,
} from '../../../apis/localRecommendations';
import type { CourseBasicInfoValues } from '../course-basic-info/schema';
import type { LocalRecommendationDraft } from '../../../store/localRecommendation.store';
import type { VisitEvent } from './constants';

const DURATION_TYPE_MAP: Record<
  CourseBasicInfoValues['duration'],
  CreateLocalRecommendationRequest['durationType']
> = {
  'day-trip': 'DAY_TRIP',
  '1-night-2-days': 'ONE_NIGHT_TWO_DAYS',
  '2-nights-3-days': 'TWO_NIGHTS_THREE_DAYS',
  '3-nights-4-days': 'THREE_NIGHTS_FOUR_DAYS',
  '4-nights-or-more': 'FOUR_NIGHTS_OR_MORE',
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
  children: 'CHILDREN',
};

export function buildCourseItemsFromVisitEvents(
  visitEvents: readonly VisitEvent[]
): CourseItem[] {
  return visitEvents.map((event, index) => {
    const order = index + 1;

    if (event.kind === 'PLACE') {
      return {
        order,
        type: 'PLACE',
        externalPlaceId: event.externalPlaceId,
        categoryGroupCode: event.categoryGroupCode,
        name: event.name,
        roadAddress: event.roadAddress,
        lotAddress: event.lotAddress,
        latitude: event.latitude,
        longitude: event.longitude,
        imageKey: event.imageKey,
      };
    }

    return { order, type: 'CONTENT', contentId: event.contentId };
  });
}

export function getCourseRequestValidationError(
  draft: LocalRecommendationDraft,
  visitEvents: readonly VisitEvent[]
): string | null {
  if (!draft.neighborhood) return '지역 선택 단계에서 지역을 선택해 주세요.';
  if (!draft.basicInfo) return '기본 정보 입력 단계에서 코스 정보를 입력해 주세요.';
  if (!draft.coverImageKey) return '대표 사진을 등록해 주세요.';
  if (visitEvents.length === 0) return '방문할 장소 또는 행사를 하나 이상 추가해 주세요.';

  const { duration, transport, companion } = draft.basicInfo;
  if (!DURATION_TYPE_MAP[duration] || !TRANSPORT_TYPE_MAP[transport] || !COMPANION_TYPE_MAP[companion]) {
    return '기본 정보의 여행 기간, 이동 수단, 동행 정보를 다시 선택해 주세요.';
  }

  return null;
}

export function buildCourseRequest(
  draft: LocalRecommendationDraft,
  visitEvents: readonly VisitEvent[]
): CreateLocalRecommendationRequest | null {
  const { neighborhood, basicInfo, coverImageKey } = draft;

  if (getCourseRequestValidationError(draft, visitEvents)) {
    return null;
  }

  if (!neighborhood || !basicInfo || !coverImageKey || visitEvents.length === 0) {
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
    regionId: neighborhood.id,
    description: basicInfo.summary,
    durationType,
    transportType,
    companionType,
    monthStart: Number(basicInfo.visitStartMonth),
    monthEnd: Number(basicInfo.visitEndMonth),
    thumbnailKey: coverImageKey,
    hashtagIds: draft.hashtagIds,
    courseItems: buildCourseItemsFromVisitEvents(visitEvents),
  };
}
