import type { GeoPoint } from '../../../components/kakaomap/types';
import type { DetailTag } from '../../../types/detail';
import type { BadgeId } from '../../../constants/badges';
import type {
  OperatingDay,
  TimeFromPrevious,
} from '../../../apis/localRecommendations';

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
  /** 수정 화면이 "유지할 사진"을 지목하는 데 쓴다. */
  readonly editableImages: { imageKey: string; imageUrl: string }[];
  readonly profileImage: string;
  readonly nickname: string;
  readonly meta: string;
  readonly content: string;
  readonly rating: number;
  readonly isMine?: boolean;
}

export interface CourseStopDto {
  readonly id: number;
  readonly placeId?: number;
  readonly contentId?: number;
  readonly order: number;
  readonly name: string;
  readonly address: string;
  readonly hours: string;
  readonly image: string;
  readonly liked: boolean;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly operatingDays?: readonly OperatingDay[];
  readonly timesFromPrevious: readonly TimeFromPrevious[];
  readonly transportToNext?: string;
}

export interface CourseStop {
  readonly id: number;
  readonly placeId?: number;
  readonly contentId?: number;
  readonly order: number;
  readonly name: string;
  readonly address: string;
  readonly hours: string;
  readonly image: string;
  readonly liked: boolean;
  readonly location?: GeoPoint;
  readonly operatingDays?: readonly OperatingDay[];
  readonly timesFromPrevious: readonly TimeFromPrevious[];
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
