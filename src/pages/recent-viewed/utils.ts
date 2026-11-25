import type { RecentCultureContent } from '../../types/content.type';
import { getDistanceKm, type UserLocation } from '../../utils/geolocation.ts';
import { formatTodayOperatingHours } from '../../utils/operatingHours.ts';
import type { RecentCourse } from '../../utils/recentCourses';
import type { RecentPromotion } from '../../utils/recentPromotions';

export type RecentViewedItem =
  | { kind: 'course'; viewedAt: number; course: RecentCourse }
  | { kind: 'content'; viewedAt: number; content: RecentCultureContent }
  | { kind: 'promotion'; viewedAt: number; promotion: RecentPromotion };

/**
 * 코스·행사·홍보글을 본 시각 최신순으로 한 목록에 섞는다.
 *
 * 본 시각(viewedAt)이 생기기 전에 저장된 항목은 0으로 보고 맨 뒤로 보낸다.
 * 값이 같으면 인자 순서(코스, 행사, 홍보글)를, 같은 종류끼리는 저장된
 * 순서(최신이 앞)를 지킨다.
 */
export function mergeRecentViewed(
  courses: readonly RecentCourse[],
  contents: readonly RecentCultureContent[],
  promotions: readonly RecentPromotion[]
): RecentViewedItem[] {
  const items: RecentViewedItem[] = [
    ...courses.map((course) => ({
      kind: 'course' as const,
      viewedAt: course.viewedAt ?? 0,
      course,
    })),
    ...contents.map((content) => ({
      kind: 'content' as const,
      viewedAt: content.viewedAt ?? 0,
      content,
    })),
    ...promotions.map((promotion) => ({
      kind: 'promotion' as const,
      viewedAt: promotion.viewedAt,
      promotion,
    })),
  ];

  return items.sort((a, b) => b.viewedAt - a.viewedAt);
}

/**
 * 홍보글 카드에 보여줄 오늘 영업시간과 현 위치까지의 거리. 영업시간·좌표를
 * 담기 전에 저장된 기록은 상세를 다시 열어야 채워진다.
 */
export function toRecentPromotionInfo(
  {
    operatingDays = [],
    latitude,
    longitude,
  }: Pick<RecentPromotion, 'operatingDays' | 'latitude' | 'longitude'>,
  userLocation: UserLocation | null,
  now: Date = new Date()
): { hoursLabel: string; distanceKm: number | null } {
  const hoursLabel =
    operatingDays.length === 0
      ? '영업시간 정보 없음'
      : (formatTodayOperatingHours(operatingDays, now) ?? '휴무');
  const distanceKm =
    userLocation && latitude !== undefined && longitude !== undefined
      ? getDistanceKm(userLocation, { latitude, longitude })
      : null;

  return { hoursLabel, distanceKm };
}
