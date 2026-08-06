
/** GET /api/v1/users/me/likes 의 category 값과 동일하게 맞춘다. */
export type LikedItemCategory = 'COURSE' | 'EVENT' | 'PLACE';
export type LikedItemQueryCategory = 'ALL' | LikedItemCategory;

/**
 * 좋아요 목록 카드 하나의 표시 데이터.
 * 목 데이터 단계이지만, 다음 작업에서 GET /api/v1/users/me/likes 응답을
 * 그대로 매핑할 수 있도록 응답 필드명(title/thumbnailUrl/duration/
 * startDate/endDate/location/hashtags/likedAt)을 유지한다.
 */
export interface LikedItem {
  id: number;
  category: LikedItemCategory;
  title: string;
  thumbnailUrl: string | null;
  /** 코스 카드의 기간 라벨. 행사/장소는 null */
  duration: string | null;
  /** 행사/장소 카드의 진행 기간. 코스는 null */
  startDate: string | null;
  endDate: string | null;
  /** 카드 두 번째 줄의 위치 정보. 코스는 이동 수단, 행사/장소는 지역명 */
  location: string;
  /** 코스 카드 두 번째 줄의 보조 정보(동행 유형) */
  companion: string | null;
  /** 코스를 선택했을 때 2번째 필터에 동적으로 채워지는 지역명 */
  region: string | null;
  /** 행사/장소를 선택했을 때 2번째 필터에서 비교할 분류값 */
  detailType: string | null;
  hashtags: string[];
  /** 최신순/오래된 순 정렬 기준 (ISO 8601) */
  likedAt: string;
}
