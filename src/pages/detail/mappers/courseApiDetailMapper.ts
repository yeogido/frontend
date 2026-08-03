import { apiTagCodeMap, tagDefinitions } from '../../../constants/tags';
import type { CourseDetailResult } from '../../../apis/courses';
import type { BadgeId } from '../../../constants/badges';
import type { DetailTag } from '../../../types/detail';
import type { TagId } from '../../../types/tag.type';
import type { CourseDetailDto, CourseStopDto } from '../types/courseDetail';

const durationLabels: Record<string, string> = {
  DAY_TRIP: '당일치기',
  ONE_NIGHT: '1박 2일',
  ONE_NIGHT_TWO_DAYS: '1박 2일',
  TWO_NIGHT: '2박 3일',
  TWO_NIGHTS_THREE_DAYS: '2박 3일',
  THREE_NIGHT: '3박 4일',
  THREE_NIGHTS_FOUR_DAYS: '3박 4일',
  THREE_PLUS: '3박 이상',
  FOUR_NIGHTS_OR_MORE: '4박 이상',
};

const transportLabels: Record<string, { label: string; icon: BadgeId }> = {
  WALK: { label: '도보', icon: 'walk' },
  CAR: { label: '자차', icon: 'car' },
  PUBLIC_TRANSPORT: { label: '대중교통', icon: 'people' },
  PUBLIC: { label: '대중교통', icon: 'people' },
};

const companionLabels: Record<string, { label: string; icon: BadgeId }> = {
  SOLO: { label: '혼자', icon: 'solo' },
  ALONE: { label: '혼자', icon: 'solo' },
  FRIEND: { label: '친구와', icon: 'group' },
  COUPLE: { label: '연인과', icon: 'group' },
  FAMILY: { label: '가족과', icon: 'group' },
  CHILDREN: { label: '아이와', icon: 'child' },
  PET: { label: '반려동물과', icon: 'group' },
};

function toTagId(tag: string): TagId | undefined {
  const code = tag.trim().toUpperCase();

  if (code in apiTagCodeMap) {
    return apiTagCodeMap[code as keyof typeof apiTagCodeMap];
  }

  return tagDefinitions.find((definition) => definition.label === tag)?.id;
}

function toDetailTags(tags: readonly string[]): DetailTag[] {
  return tags.map((tag, index) => ({
    id: `${tag}-${index}`,
    tagId: toTagId(tag),
    label: tag,
  }));
}

function formatMonthRange(startMonth: number, endMonth: number): string {
  return startMonth === endMonth
    ? `${startMonth}월`
    : `${startMonth}월 - ${endMonth}월`;
}

function toCourseStops(
  course: CourseDetailResult
): readonly CourseStopDto[] {
  return course.courseItems.map((item) => ({
    id: item.order,
    placeId: item.type === 'PLACE' ? item.placeId : undefined,
    contentId: item.type === 'CONTENT' ? item.contentId : undefined,
    order: item.order,
    name: item.name,
    address: item.roadAddress || item.lotAddress || '',
    hours: '',
    image: course.thumbnailUrl,
    liked: item.isLiked,
    latitude: item.latitude,
    longitude: item.longitude,
  }));
}

export function mapCourseApiDetailToDto(
  course: CourseDetailResult
): CourseDetailDto {
  const transport = transportLabels[course.transportType] ?? {
    label: course.transportType,
    icon: 'people' as const,
  };
  const companion = companionLabels[course.companionType] ?? {
    label: course.companionType,
    icon: 'group' as const,
  };

  return {
    id: course.courseId,
    title: course.title,
    heroImageUrl: course.thumbnailUrl,
    liked: course.isLiked,
    tags: toDetailTags(course.tags),
    infoBadges: [
      {
        id: 'duration',
        label: durationLabels[course.durationType] ?? course.durationType,
        icon: 'calendar',
      },
      { id: 'transport', label: transport.label, icon: transport.icon },
      {
        id: 'months',
        label: formatMonthRange(course.startMonth, course.endMonth),
        icon: 'calendar',
      },
      { id: 'companion', label: companion.label, icon: companion.icon },
    ],
    overview: course.description,
    stops: toCourseStops(course),
    reviews: [],
  };
}
