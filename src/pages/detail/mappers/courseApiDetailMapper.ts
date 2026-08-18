import { apiTagCodeMap, tagDefinitions } from '../../../constants/tags';
import type { CourseDetailResult } from '../../../apis/courses';
import type { BadgeId } from '../../../constants/badges';
import type { DetailTag } from '../../../types/detail';
import type { TagId } from '../../../types/tag.type';
import type {
  Course,
  CourseCompanionType,
  CourseDurationType,
  CourseTransportType,
} from '../../../types/course.type';
import type { CourseDetailDto, CourseStopDto } from '../types/courseDetail';
import { getDetailCompanionBadge } from './detailCompanionBadge';

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

function toCourseStops(course: CourseDetailResult): readonly CourseStopDto[] {
  return course.courseItems.map((item) => ({
    id: item.courseItemId,
    placeId: item.type === 'PLACE' ? item.placeId : undefined,
    contentId: item.type === 'CONTENT' ? item.contentId : undefined,
    order: item.order,
    name: item.name,
    address: item.roadAddress || item.lotAddress || '',
    hours: '',
    image: item.imageUrl,
    liked: item.isLiked,
    latitude: item.latitude,
    longitude: item.longitude,
    operatingDays: item.type === 'PLACE' ? item.operatingDays : undefined,
    timesFromPrevious: item.timesFromPrevious ?? [],
  }));
}

export function mapCourseApiDetailToDto(
  course: CourseDetailResult
): CourseDetailDto {
  const transport = transportLabels[course.transportType] ?? {
    label: course.transportType,
    icon: 'people' as const,
  };
  const companion = getDetailCompanionBadge(course.companionType);

  return {
    id: course.courseId,
    title: course.title,
    heroImageUrl: course.routeImageUrl?.trim() || course.thumbnailUrl,
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
    canManage: course.canManage,
  };
}

// 코스 상세 응답에는 region이 내려오지 않아, 첫 번째 코스 아이템 주소에서
// 시/도 다음 토큰(구/군 등)을 지역명으로 대략 추출한다.
// 세종특별자치시는 구/군 없이 시 다음에 바로 도로명이 오는 주소 체계라
// 두 번째 토큰을 그대로 쓰면 도로명이 지역명으로 잘못 뽑힌다 — 그런 단일
// 행정구역은 시/도 토큰 자체를 지역명으로 쓴다.
const SINGLE_TIER_REGIONS = ['세종특별자치시'];

function deriveRegionFromCourseItems(
  courseItems: CourseDetailResult['courseItems']
): string {
  const address = courseItems[0]?.roadAddress || courseItems[0]?.lotAddress;
  if (!address) return '';

  const tokens = address.split(' ');
  if (SINGLE_TIER_REGIONS.includes(tokens[0])) return tokens[0];

  return tokens[1] ?? '';
}

// durationLabels/transportLabels/companionLabels가 인식하는 레거시 별칭까지
// toCourseCardProps가 쓰는 canonical enum 값으로 정규화해서, 저장/표시 단계에서
// 라벨이 비는 일이 없도록 한다.
function toCanonicalDurationType(durationType: string): CourseDurationType {
  switch (durationType) {
    case 'ONE_NIGHT':
    case 'ONE_NIGHT_TWO_DAYS':
      return 'ONE_NIGHT';
    case 'TWO_NIGHT':
    case 'TWO_NIGHTS_THREE_DAYS':
      return 'TWO_NIGHT';
    case 'THREE_NIGHT':
    case 'THREE_NIGHTS_FOUR_DAYS':
    case 'THREE_PLUS':
    case 'FOUR_NIGHTS_OR_MORE':
      return 'THREE_PLUS';
    case 'DAY_TRIP':
    default:
      return 'DAY_TRIP';
  }
}

function toCanonicalTransportType(transportType: string): CourseTransportType {
  switch (transportType) {
    case 'WALK':
      return 'WALK';
    case 'PUBLIC':
    case 'PUBLIC_TRANSPORT':
      return 'PUBLIC';
    case 'CAR':
    default:
      return 'CAR';
  }
}

function toCanonicalCompanionType(companionType: string): CourseCompanionType {
  switch (companionType) {
    case 'FRIEND':
      return 'FRIEND';
    case 'COUPLE':
      return 'COUPLE';
    case 'FAMILY':
      return 'FAMILY';
    case 'PET':
      return 'PET';
    case 'SOLO':
    default:
      return 'SOLO';
  }
}

export function mapCourseApiDetailToCourseSummary(
  course: CourseDetailResult
): Course {
  return {
    courseId: course.courseId,
    thumbnailUrl: course.routeImageUrl?.trim() || course.thumbnailUrl,
    title: course.title,
    region: deriveRegionFromCourseItems(course.courseItems),
    durationType: toCanonicalDurationType(course.durationType),
    transportType: toCanonicalTransportType(course.transportType),
    companionType: toCanonicalCompanionType(course.companionType),
    tags: course.tags,
    isLiked: course.isLiked,
    canManage: course.canManage,
  };
}
