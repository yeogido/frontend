import { toContentTagId } from '../../../utils/contentTags';
import type { OperatingDay } from '../../../utils/operatingHours';
import type {
  BusinessPromotionBusinessHour,
  BusinessPromotionDetailResponse,
  BusinessPromotionImage,
} from '../../../types/businessPromotion.type';
import type { DetailTag } from '../../../types/detail';

import type { BusinessPromotionDetail } from '../types/businessPromotionDetail';

const DAY_OF_WEEK_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

const DAY_OF_WEEK_LABEL: Record<string, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

const NO_HOURS_LABEL = '영업시간 정보 없음';

function getHeroImageUrls(images: BusinessPromotionImage[]): string[] {
  return [...images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => image.imageUrl);
}

function formatBusinessHours(
  businessHours: BusinessPromotionBusinessHour[]
): string {
  if (businessHours.length === 0) {
    return NO_HOURS_LABEL;
  }

  const coveredDays = new Set(businessHours.map((hour) => hour.dayOfWeek));
  const isSameEveryDay =
    DAY_OF_WEEK_ORDER.every((day) => coveredDays.has(day)) &&
    businessHours.every(
      (hour) =>
        hour.openTime === businessHours[0].openTime &&
        hour.closeTime === businessHours[0].closeTime
    );

  if (isSameEveryDay) {
    return `매일 ${businessHours[0].openTime} - ${businessHours[0].closeTime}`;
  }

  const sorted = [...businessHours].sort(
    (a, b) =>
      DAY_OF_WEEK_ORDER.indexOf(
        a.dayOfWeek as (typeof DAY_OF_WEEK_ORDER)[number]
      ) -
      DAY_OF_WEEK_ORDER.indexOf(
        b.dayOfWeek as (typeof DAY_OF_WEEK_ORDER)[number]
      )
  );

  return sorted
    .map(
      (hour) =>
        `${DAY_OF_WEEK_LABEL[hour.dayOfWeek] ?? hour.dayOfWeek} ${hour.openTime}-${hour.closeTime}`
    )
    .join(', ');
}

function toOperatingDays(
  businessHours: readonly BusinessPromotionBusinessHour[]
): OperatingDay[] {
  return businessHours.flatMap((hour) =>
    DAY_OF_WEEK_ORDER.includes(
      hour.dayOfWeek as (typeof DAY_OF_WEEK_ORDER)[number]
    )
      ? [
          {
            dayOfWeek: hour.dayOfWeek as OperatingDay['dayOfWeek'],
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          },
        ]
      : []
  );
}

function mapHashtagsToTags(hashtags: string[]): DetailTag[] {
  return hashtags.map((hashtag, index) => {
    const tagId = toContentTagId(hashtag);

    return { id: `${tagId ?? 'text'}-${index}`, tagId, label: hashtag };
  });
}

export function mapBusinessPromotionDetail(
  detail: BusinessPromotionDetailResponse
): BusinessPromotionDetail {
  const heroImageUrls = getHeroImageUrls(detail.images);

  return {
    id: detail.promotionId,
    placeId: detail.place.placeId,
    title: detail.place.name,
    heroImageUrl: heroImageUrls[0] ?? '',
    heroImageUrls,
    liked: detail.isLiked,
    isMine: detail.isMine,
    tags: mapHashtagsToTags(detail.hashtags),
    overview: detail.shortDescription,
    address: detail.place.roadAddress,
    hours: formatBusinessHours(detail.businessHours),
    operatingDays: toOperatingDays(detail.businessHours),
    phone: detail.phoneNumber,
    snsAccount: detail.snsAccount,
    location:
      Number.isFinite(detail.place.latitude) &&
      Number.isFinite(detail.place.longitude)
        ? { latitude: detail.place.latitude, longitude: detail.place.longitude }
        : undefined,
  };
}
