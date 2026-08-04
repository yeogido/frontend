import {
  isValidGeoPoint,
  type GeoPoint,
} from '../../../components/kakaomap/types';
import type {
  CourseBadgeItem,
  CourseDetail,
  CourseDetailDto,
  CourseInfoBadgeTuple,
  CourseStop,
  CourseStopDto,
} from '../types/courseDetail';

export function isCourseStopDto(dto: unknown): dto is CourseStopDto {
  if (typeof dto !== 'object' || dto === null) return false;
  const candidate = dto as Record<string, unknown>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.order === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.address === 'string'
  );
}

export function isCourseDetailDto(dto: unknown): dto is CourseDetailDto {
  if (typeof dto !== 'object' || dto === null) return false;
  const candidate = dto as Record<string, unknown>;

  return (
    typeof candidate.title === 'string' &&
    typeof candidate.heroImageUrl === 'string' &&
    Array.isArray(candidate.infoBadges) &&
    Array.isArray(candidate.stops)
  );
}

export function mapToCourseInfoBadgeTuple(
  badges: readonly CourseBadgeItem[]
): CourseInfoBadgeTuple {
  const b0 = badges[0];
  const b1 = badges[1];
  const b2 = badges[2];
  const b3 = badges[3];

  if (!b0 || !b1 || !b2 || !b3 || badges.length !== 4) {
    throw new Error(
      `CourseInfoBadgesCard에는 정확히 4개의 배지가 필요합니다. (전달된 배지 개수: ${badges.length})`
    );
  }

  return [b0, b1, b2, b3];
}

export function mapCourseStopDtoToViewModel(dto: unknown): CourseStop {
  if (!isCourseStopDto(dto)) {
    throw new Error('올바르지 않은 CourseStop DTO 형식입니다.');
  }

  let location: GeoPoint | undefined = undefined;
  if (typeof dto.latitude === 'number' && typeof dto.longitude === 'number') {
    const candidateLocation = {
      latitude: dto.latitude,
      longitude: dto.longitude,
    };
    if (isValidGeoPoint(candidateLocation)) {
      location = candidateLocation;
    }
  }

  return {
    id: dto.id,
    placeId: dto.placeId,
    contentId: dto.contentId,
    order: dto.order,
    name: dto.name,
    address: dto.address,
    hours: dto.hours ?? '',
    image: dto.image ?? '',
    liked: Boolean(dto.liked),
    location,
    transportToNext: dto.transportToNext,
  };
}

export function mapCourseDetailDtoToViewModel(
  dto: unknown,
  fallbackId: string | number = 'default-id'
): CourseDetail {
  if (!isCourseDetailDto(dto)) {
    throw new Error(
      '올바르지 않은 CourseDetail DTO 형식입니다. 필수 필드가 누락되었습니다.'
    );
  }

  const badgeTuple = mapToCourseInfoBadgeTuple(dto.infoBadges);
  const stops = dto.stops.map(mapCourseStopDtoToViewModel);

  return {
    id: dto.id ?? fallbackId,
    title: dto.title,
    heroImageUrl: dto.heroImageUrl,
    liked: Boolean(dto.liked),
    tags: dto.tags ?? [],
    infoBadges: badgeTuple,
    overview: dto.overview ?? '',
    stops,
    reviews: dto.reviews ?? [],
  };
}
