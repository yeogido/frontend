import type { DetailTag } from '../../../types/detail';
import type { CultureContentDetail } from '../../../types/content.type';
import { toContentTagId } from '../../../utils/contentTags';

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

function mapCourses(
  courses: CultureContentDetail['courses'],
): FestivalRelatedCourse[] {
  return courses.map((course) => ({
    id: course.courseId,
    image: toImageUrl(course.thumbnailImageUrl ?? course.thumbnailImage),
    title: course.title,
    duration: course.duration ?? course.durationType ?? '',
    courseType: course.transportType,
    companion: course.companionType,
    tags: [],
    liked: course.liked,
  }));
}

export function mapCultureContentDetailToFestivalDetail(
  content: CultureContentDetail,
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
    homepageUrl: content.officialUrl,
    homepageLabel: '공식 홈페이지',
    place: {
      id: content.place.placeId,
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
    relatedCourses: mapCourses(content.courses),
  };
}
