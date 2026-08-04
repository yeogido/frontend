import type { GeoPoint } from '../../../components/kakaomap/types';
import type { DetailTag } from '../../../types/detail';

export interface BusinessPromotionDetail {
  readonly id: number;
  readonly title: string;
  readonly heroImageUrl: string;
  readonly liked: boolean;
  readonly tags: readonly DetailTag[];
  readonly overview: string;
  readonly address: string;
  readonly hours: string;
  readonly phone: string;
  readonly snsAccount: string;
  readonly location?: GeoPoint;
}
