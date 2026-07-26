import type { GeoPoint } from '../../../components/kakaomap/types';
import type { DetailTag } from '../../../types/detail';
import type { BadgeId } from '../../../constants/badges';

export interface CourseBadgeItem {
  readonly id: string | number;
  readonly label: string;
  readonly icon: BadgeId;
}

export type CourseInfoBadgeTuple = readonly [
  CourseBadgeItem,
  CourseBadgeItem,
  CourseBadgeItem,
  CourseBadgeItem,
];

export interface CourseReview {
  readonly id: number;
  readonly images: string[];
  readonly profileImage: string;
  readonly nickname: string;
  readonly meta: string;
  readonly content: string;
  readonly rating: number;
}

export interface CourseStopDto {
  readonly id: number;
  readonly order: number;
  readonly name: string;
  readonly address: string;
  readonly hours: string;
  readonly image: string;
  readonly liked: boolean;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly transportToNext?: string;
}

export interface CourseStop {
  readonly id: number;
  readonly order: number;
  readonly name: string;
  readonly address: string;
  readonly hours: string;
  readonly image: string;
  readonly liked: boolean;
  readonly location?: GeoPoint;
  readonly transportToNext?: string;
}

export interface CourseDetailDto {
  readonly id?: string | number;
  readonly title: string;
  readonly heroImageUrl: string;
  readonly liked: boolean;
  readonly tags: readonly DetailTag[];
  readonly infoBadges: readonly CourseBadgeItem[];
  readonly overview: string;
  readonly stops: readonly CourseStopDto[];
  readonly reviews: readonly CourseReview[];
}

export interface CourseDetail {
  readonly id: string | number;
  readonly title: string;
  readonly heroImageUrl: string;
  readonly liked: boolean;
  readonly tags: readonly DetailTag[];
  readonly infoBadges: CourseInfoBadgeTuple;
  readonly overview: string;
  readonly stops: readonly CourseStop[];
  readonly reviews: readonly CourseReview[];
}
