import type { CreateLocalRecommendationRequest } from '../../../../apis/localRecommendations';
import type { UpdateCourseRequest } from '../../../../apis/courses';
import type { CourseBasicInfoValues } from '../../../local-recommendation/course-basic-info/schema';
import type { Neighborhood } from '../../../local-recommendation/region-selection/types';
import { buildCourseItemsFromVisitEvents } from '../../../local-recommendation/visit-order-selection/buildCourseRequest';
import type { VisitEvent } from '../../../local-recommendation/visit-order-selection/constants';
import type { VisitEventTravelData } from '../../../local-recommendation/visit-order-selection/useVisitEventTravelData';
import { FORM_DURATION_TO_DURATION_TYPE } from '../../../local-recommendation/course-basic-info/constants/options.ts';
import { isTotalDaysValidForDuration } from '../../../../utils/courseDetail.ts';
import type { AdminCoursePhoto } from '../types';

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

interface AdminCourseRequestParams {
  region: Neighborhood | null;
  basicInfo: CourseBasicInfoValues | null;
  photo: AdminCoursePhoto | null;
  /** 수정 중 대표 사진을 새로 고르지 않았을 때 재사용할 기존 key. */
  existingThumbnailKey?: string | null;
  /** 일차별 방문 일정 — 인덱스 0이 1일차다. */
  visitEventsByDay: readonly (readonly VisitEvent[])[];
  /** 실제 여행 일수. basicInfo.duration과 맞아야 한다. */
  totalDays: number;
}

export function getAdminCourseRequestValidationError(
  params: AdminCourseRequestParams
): string | null {
  const {
    region,
    basicInfo,
    photo,
    existingThumbnailKey,
    visitEventsByDay,
    totalDays,
  } = params;

  if (!region) return '지역 선택 단계에서 지역을 선택해 주세요.';
  if (!basicInfo) return '기본 정보 입력 단계에서 코스 정보를 입력해 주세요.';
  if (!photo?.file && !existingThumbnailKey)
    return '대표 사진을 등록해 주세요.';

  const { duration, transport, companion } = basicInfo;
  const durationType = FORM_DURATION_TO_DURATION_TYPE[duration];
  if (
    !durationType ||
    !TRANSPORT_TYPE_MAP[transport] ||
    !COMPANION_TYPE_MAP[companion]
  ) {
    return '기본 정보의 여행 기간, 이동 수단, 동행 정보를 다시 선택해 주세요.';
  }

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

  if (
    visitEventsByDay
      .flat()
      .some(
        (event) =>
          event.kind === 'PLACE' &&
          !event.roadAddress?.trim() &&
          !event.lotAddress?.trim()
      )
  ) {
    return '장소의 도로명 주소 또는 지번 주소를 입력해 주세요.';
  }

  return null;
}

export function buildAdminCourseRequest(
  params: AdminCourseRequestParams & {
    thumbnailKey: string;
    hashtagIds: number[];
    travelData?: VisitEventTravelData;
    routeImageKey: string;
  }
): CreateLocalRecommendationRequest | null {
  const {
    region,
    basicInfo,
    thumbnailKey,
    hashtagIds,
    visitEventsByDay,
    totalDays,
    travelData,
    routeImageKey,
  } = params;

  if (getAdminCourseRequestValidationError(params)) {
    return null;
  }

  if (!region || !basicInfo) {
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
    regionId: region.id,
    description: basicInfo.summary,
    durationType,
    transportType,
    companionType,
    monthStart: Number(basicInfo.visitStartMonth),
    monthEnd: Number(basicInfo.visitEndMonth),
    totalDays,
    thumbnailKey,
    routeImageKey,
    hashtagIds,
    courseItems: buildCourseItemsFromVisitEvents(visitEventsByDay, travelData),
  };
}

/**
 * 수정 요청은 지역을 바꿀 수 없어(라이브 스펙에 regionId 필드 자체가 없다)
 * region은 마법사 단계 가드만 통과하면 되고 실제 페이로드에는 들어가지
 * 않는다 — 그래서 검증은 기존 함수를 그대로 쓰고, 페이로드만 regionId
 * 없이 다시 만든다.
 */
export function buildAdminCourseUpdateRequest(
  params: AdminCourseRequestParams & {
    thumbnailKey: string;
    hashtagIds: number[];
    travelData?: VisitEventTravelData;
    routeImageKey?: string;
  }
): UpdateCourseRequest | null {
  const {
    basicInfo,
    thumbnailKey,
    routeImageKey,
    hashtagIds,
    visitEventsByDay,
    totalDays,
    travelData,
  } = params;

  if (getAdminCourseRequestValidationError(params)) {
    return null;
  }

  if (!basicInfo) {
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
    totalDays,
    transportType,
    companionType,
    monthStart: Number(basicInfo.visitStartMonth),
    monthEnd: Number(basicInfo.visitEndMonth),
    thumbnailKey,
    ...(routeImageKey ? { routeImageKey } : {}),
    hashtagIds,
    courseItems: buildCourseItemsFromVisitEvents(visitEventsByDay, travelData),
  };
}
