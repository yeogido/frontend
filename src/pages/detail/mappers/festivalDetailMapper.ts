import {
  isValidGeoPoint,
  type GeoPoint,
  // node --test 가 이 모듈을 직접 실행하므로 런타임 import 에 확장자가 필요하다.
} from '../../../components/kakaomap/types.ts';
import type {
  FestivalDetail,
  FestivalDetailDto,
  FestivalPlace,
  FestivalPlaceDto,
} from '../types/festivalDetail';

/** http/https 만 허용한다. javascript: 등 스킴 주입 방지. */
export function toSafeExternalUrl(url: unknown): string | undefined {
  if (typeof url !== 'string' || url.trim() === '') return undefined;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? url
      : undefined;
  } catch {
    return undefined;
  }
}

/** 숫자/+ 만 남겨 tel: 링크로 만든다. 유효하지 않으면 undefined. */
export function toTelHref(phone: unknown): string | undefined {
  if (typeof phone !== 'string') return undefined;

  const digits = phone.replace(/[^\d+]/g, '');
  return digits.length >= 8 ? `tel:${digits}` : undefined;
}

export function isFestivalPlaceDto(dto: unknown): dto is FestivalPlaceDto {
  if (typeof dto !== 'object' || dto === null) return false;
  const candidate = dto as Record<string, unknown>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.address === 'string'
  );
}

export function isFestivalDetailDto(dto: unknown): dto is FestivalDetailDto {
  if (typeof dto !== 'object' || dto === null) return false;
  const candidate = dto as Record<string, unknown>;

  return (
    typeof candidate.title === 'string' &&
    typeof candidate.heroImageUrl === 'string' &&
    typeof candidate.address === 'string' &&
    typeof candidate.period === 'string' &&
    isFestivalPlaceDto(candidate.place) &&
    Array.isArray(candidate.relatedCourses)
  );
}

export function mapFestivalPlaceDtoToViewModel(dto: unknown): FestivalPlace {
  if (!isFestivalPlaceDto(dto)) {
    throw new Error('올바르지 않은 FestivalPlace DTO 형식입니다.');
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
    name: dto.name,
    address: dto.address,
    hours: dto.hours ?? '',
    image: dto.image ?? '',
    liked: Boolean(dto.liked),
    location,
  };
}

export function mapFestivalDetailDtoToViewModel(
  dto: unknown,
  fallbackId: string | number = 'default-id'
): FestivalDetail {
  if (!isFestivalDetailDto(dto)) {
    throw new Error(
      '올바르지 않은 FestivalDetail DTO 형식입니다. 필수 필드가 누락되었습니다.'
    );
  }

  return {
    id: dto.id ?? fallbackId,
    title: dto.title,
    heroImageUrl: dto.heroImageUrl,
    liked: Boolean(dto.liked),
    tags: dto.tags ?? [],
    overview: dto.overview ?? '',
    address: dto.address,
    period: dto.period,
    phone: dto.phone ?? '',
    homepageUrl: toSafeExternalUrl(dto.homepageUrl) ?? '',
    homepageLabel: dto.homepageLabel ?? '공식홈페이지',
    place: mapFestivalPlaceDtoToViewModel(dto.place),
    relatedCourses: dto.relatedCourses ?? [],
  };
}
