import type { DetailTag } from '../../../types/detail';
import type { CultureContentDetail } from '../../../types/content.type';
import { toContentTagId } from '../../../utils/contentTags';
import {
  toCompanionLabel,
  toDurationLabel,
  toTransportLabel,
} from '../../../utils/courseEnumLabels';

import type {
  FestivalDetail,
  FestivalRelatedCourse,
} from '../types/festivalDetail';

function toImageUrl(value: string | undefined): string {
  if (!value) return '';

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? value : '';
  } catch {
    return '';
  }
}

function mapTags(hashtags: string[]): DetailTag[] {
  return hashtags.flatMap((hashtag, index) => {
    const tagId = toContentTagId(hashtag);

    return tagId ? [{ id: `${tagId}-${index}`, tagId, label: hashtag }] : [];
  });
}

export function mapFestivalRelatedCourses(
  courses: CultureContentDetail['courses']
): FestivalRelatedCourse[] {
  return courses.map((course) => ({
    id: course.courseId,
    image: toImageUrl(course.thumbnailImageUrl ?? course.thumbnailImage),
    title: course.title,
    duration: course.durationType
      ? toDurationLabel(course.durationType)
      : (course.duration ?? ''),
    courseType: toTransportLabel(course.transportType),
    companion: toCompanionLabel(course.companionType),
    tags: [],
    liked: course.liked,
  }));
}

export function mapCultureContentDetailToFestivalDetail(
  content: CultureContentDetail
): FestivalDetail {
  const image = toImageUrl(content.thumbnailImageUrl ?? content.thumbnailImage);

  return {
    id: content.contentId,
    title: content.title,
    heroImageUrl: image,
    liked: content.liked,
    tags: mapTags(content.hashtags),
    overview: content.description,
    address: content.place.roadAddress,
    period: `${content.startDate.replace(/-/g, '.')} ~ ${content.endDate.replace(/-/g, '.')}`,
    phone: content.phone,
    // 관광공사 동기화 콘텐츠는 홈페이지가 아니라 인스타그램 등 다른 타입
    // 링크만 있을 수 있다 — 그 경우도 "공식 홈페이지" 자리에 그대로 보여준다
    // (수정 화면도 타입 상관없이 첫 링크를 "공식 홈페이지"로 다룬다).
    homepageUrl:
      content.officialLinks.find((link) => link.type === 'OFFICIAL_WEBSITE')
        ?.url ??
      content.officialLinks[0]?.url ??
      '',
    homepageLabel: '공식 홈페이지',
    place: {
      id: content.place.placeId,
      courseItemId: content.place.courseItemId,
      name: content.place.name,
      address: content.place.roadAddress,
      hours: '',
      image,
      liked: false,
      location: {
        latitude: content.place.latitude,
        longitude: content.place.longitude,
      },
    },
    relatedCourses: mapFestivalRelatedCourses(content.courses),
  };
}
