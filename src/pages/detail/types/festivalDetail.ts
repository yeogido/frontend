import type { GeoPoint } from '../../../components/kakaomap/types';
import type { DetailTag } from '../../../types/detail';
import type { TagId } from '../../../types/tag.type';

export interface FestivalPlaceDto {
  readonly id: number;
  readonly courseItemId?: number;
  readonly name: string;
  readonly address: string;
  readonly hours: string;
  readonly image: string;
  readonly liked: boolean;
  readonly latitude?: number;
  readonly longitude?: number;
}

export interface FestivalPlace {
  readonly id: number;
  readonly courseItemId: number;
  readonly name: string;
  readonly address: string;
  readonly hours: string;
  readonly image: string;
  readonly liked: boolean;
  readonly location?: GeoPoint;
}

/** 행사가 포함된 코스 카드. 공용 CourseCard props 와 같은 모양을 유지한다. */
export interface FestivalRelatedCourse {
  readonly id: number;
  readonly image: string;
  readonly title: string;
  readonly duration: string;
  readonly courseType: string;
  readonly companion: string;
  readonly tags: readonly TagId[];
  readonly liked: boolean;
}

export interface FestivalDetailDto {
  readonly id?: string | number;
  readonly title: string;
  readonly heroImageUrl: string;
  readonly liked: boolean;
  readonly tags: readonly DetailTag[];
  readonly overview: string;
  readonly address: string;
  readonly period: string;
  readonly phone: string;
  readonly homepageUrl: string;
  readonly homepageLabel?: string;
  readonly place: FestivalPlaceDto;
  readonly relatedCourses: readonly FestivalRelatedCourse[];
}

export interface FestivalDetail {
  readonly id: string | number;
  readonly title: string;
  readonly heroImageUrl: string;
  readonly liked: boolean;
  readonly tags: readonly DetailTag[];
  readonly overview: string;
  readonly address: string;
  readonly period: string;
  readonly phone: string;
  readonly homepageUrl: string;
  readonly homepageLabel: string;
  readonly place: FestivalPlace;
  readonly relatedCourses: readonly FestivalRelatedCourse[];
}
