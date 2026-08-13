import type { GeoPoint } from '../../../components/kakaomap/types';
import type { DetailTag } from '../../../types/detail';

export interface BusinessPromotionDetail {
  readonly id: number;
  readonly placeId: number;
  readonly title: string;
  readonly heroImageUrl: string;
  /** 등록 시 올린 사진 전체(최대 5장), sortOrder순. 히어로 캐러셀 전용 — 그 외엔 heroImageUrl(대표 1장)을 쓴다. */
  readonly heroImageUrls: readonly string[];
  readonly liked: boolean;
  readonly isMine: boolean;
  readonly tags: readonly DetailTag[];
  readonly overview: string;
  readonly address: string;
  readonly hours: string;
  readonly phone: string;
  readonly snsAccount: string;
  readonly location?: GeoPoint;
}
