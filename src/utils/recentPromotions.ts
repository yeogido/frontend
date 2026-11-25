import { useAuthStore } from '../store/auth.store.ts';

export const RECENT_PROMOTIONS_STORAGE_KEY = 'recent-promotions';
export const MAX_RECENT_PROMOTIONS = 10;
// 코스·행사와 같은 이유: 같은 탭에서 목록이 바뀌면 이미 그려진 화면도 다시
// 읽도록 변경할 때마다 이벤트를 쏜다.
export const RECENT_PROMOTIONS_UPDATED_EVENT = 'recent-promotions-updated';

/**
 * 상세를 열었을 때 저장해 두는 소상공인 홍보글 스냅샷. 목록 카드를 그리는 데
 * 필요한 값만 담는다(태그는 라벨 문자열 그대로, 그릴 때 변환).
 */
export interface RecentPromotion {
  promotionId: number;
  // 좋아요는 홍보글이 아니라 장소(placeId) 단위 API라 따로 든다.
  placeId: number;
  title: string;
  location: string;
  date: string;
  image: string;
  hashtags: string[];
  liked: boolean;
  viewedAt: number;
}

function notifyRecentPromotionsUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(RECENT_PROMOTIONS_UPDATED_EVENT));
}

function getStorageKey(): string {
  const userId = useAuthStore.getState().userId;

  return userId === null
    ? RECENT_PROMOTIONS_STORAGE_KEY
    : `${RECENT_PROMOTIONS_STORAGE_KEY}:${userId}`;
}

function isRecentPromotion(value: unknown): value is RecentPromotion {
  if (typeof value !== 'object' || value === null) return false;

  const promotion = value as Record<string, unknown>;

  return (
    typeof promotion.promotionId === 'number' &&
    typeof promotion.placeId === 'number' &&
    typeof promotion.title === 'string' &&
    typeof promotion.location === 'string' &&
    typeof promotion.date === 'string' &&
    typeof promotion.image === 'string' &&
    Array.isArray(promotion.hashtags) &&
    promotion.hashtags.every((hashtag) => typeof hashtag === 'string') &&
    typeof promotion.liked === 'boolean' &&
    typeof promotion.viewedAt === 'number'
  );
}

export function upsertRecentPromotion(
  promotions: readonly RecentPromotion[],
  promotion: RecentPromotion
): RecentPromotion[] {
  return [
    promotion,
    ...promotions.filter((item) => item.promotionId !== promotion.promotionId),
  ].slice(0, MAX_RECENT_PROMOTIONS);
}

export function getStoredRecentPromotions(): RecentPromotion[] {
  if (typeof window === 'undefined') return [];

  try {
    const storageKey = getStorageKey();
    const ownStored = window.localStorage.getItem(storageKey);
    // 코스·행사처럼, 이 계정의 기록이 아직 없으면 비로그인 때 본 목록을 쓴다.
    // 비로그인 목록의 좋아요 표시는 이 계정 것이 아니라 지운다.
    const isGuestFallback =
      ownStored === null && storageKey !== RECENT_PROMOTIONS_STORAGE_KEY;
    const stored = isGuestFallback
      ? window.localStorage.getItem(RECENT_PROMOTIONS_STORAGE_KEY)
      : ownStored;

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isRecentPromotion)
      .map((item) => (isGuestFallback ? { ...item, liked: false } : item))
      .slice(0, MAX_RECENT_PROMOTIONS);
  } catch {
    return [];
  }
}

export function saveRecentPromotion(
  promotion: Omit<RecentPromotion, 'viewedAt'>
): void {
  if (typeof window === 'undefined') return;

  try {
    const promotions = upsertRecentPromotion(getStoredRecentPromotions(), {
      ...promotion,
      viewedAt: Date.now(),
    });

    window.localStorage.setItem(getStorageKey(), JSON.stringify(promotions));
    notifyRecentPromotionsUpdated();
  } catch {
    return;
  }
}

/**
 * 삭제된 홍보글은 계정을 가리지 않고 목록에서 빠져야 한다. 이유는
 * recentCourses.ts의 removeRecentCourse 주석 참고.
 */
export function removeRecentPromotion(promotionId: number): void {
  if (typeof window === 'undefined') return;

  try {
    let hasRemoved = false;

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (
        key !== RECENT_PROMOTIONS_STORAGE_KEY &&
        !key?.startsWith(`${RECENT_PROMOTIONS_STORAGE_KEY}:`)
      ) {
        continue;
      }

      const stored = window.localStorage.getItem(key);

      if (!stored) continue;

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) continue;

      const remaining = parsed.filter(
        (item) =>
          (item as { promotionId?: unknown } | null)?.promotionId !==
          promotionId
      );

      if (remaining.length === parsed.length) continue;

      window.localStorage.setItem(key, JSON.stringify(remaining));
      hasRemoved = true;
    }

    if (hasRemoved) {
      notifyRecentPromotionsUpdated();
    }
  } catch {
    return;
  }
}

/** 로그아웃하면 목록은 두고 좋아요 표시만 지운다(코스·행사와 같다). */
export function clearRecentPromotionsLikedState(): void {
  if (typeof window === 'undefined') return;

  try {
    const promotions = getStoredRecentPromotions();

    if (!promotions.some((item) => item.liked)) return;

    window.localStorage.setItem(
      getStorageKey(),
      JSON.stringify(promotions.map((item) => ({ ...item, liked: false })))
    );
    notifyRecentPromotionsUpdated();
  } catch {
    return;
  }
}

export function updateRecentPromotionLikeState(
  promotionId: number,
  liked: boolean
): void {
  if (typeof window === 'undefined') return;

  try {
    const promotions = getStoredRecentPromotions();

    if (!promotions.some((item) => item.promotionId === promotionId)) return;

    window.localStorage.setItem(
      getStorageKey(),
      JSON.stringify(
        promotions.map((item) =>
          item.promotionId === promotionId ? { ...item, liked } : item
        )
      )
    );
    notifyRecentPromotionsUpdated();
  } catch {
    return;
  }
}
