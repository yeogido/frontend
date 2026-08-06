import { courseImage } from '../../../detail/constants/courseDetailMock';
import type {
  CourseBadgeItem,
  CourseDetailDto,
  CourseStopDto,
} from '../../../detail/types/courseDetail';
import {
  companionOptions,
  durationOptions,
  transportOptions,
} from '../../../local-recommendation/course-basic-info/constants/options';
import type { CourseBasicInfoValues } from '../../../local-recommendation/course-basic-info/schema';
import type { VisitEvent } from '../../../local-recommendation/visit-order-selection/constants';
import type { BadgeId } from '../../../../constants/badges';
import { tagDefinitionMap } from '../../../../constants/tags';
import type { DetailTag } from '../../../../types/detail';
import type { TagId } from '../../../../types/tag.type';
import type { AdminCoursePhoto } from '../types';

const TRANSPORT_BADGE_ICON: Record<CourseBasicInfoValues['transport'], BadgeId> = {
  walking: 'walk',
  public: 'walk',
  car: 'car',
};

const COMPANION_BADGE_ICON: Record<CourseBasicInfoValues['companion'], BadgeId> = {
  solo: 'solo',
  friends: 'group',
  couple: 'favorite',
  family: 'people',
  pet: 'child',
};

function findLabel(
  options: readonly { value: string; label: string }[],
  value: string
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function buildPreviewCourseDetail(params: {
  basicInfo: CourseBasicInfoValues;
  photo: AdminCoursePhoto | null;
  keywordTagIds: TagId[];
  visitEvents: VisitEvent[];
}): CourseDetailDto {
  const { basicInfo, photo, keywordTagIds, visitEvents } = params;

  const tags: DetailTag[] = keywordTagIds.map((tagId) => ({
    id: tagId,
    tagId,
    label: tagDefinitionMap[tagId]?.label ?? tagId,
  }));

  const infoBadges: CourseBadgeItem[] = [
    {
      id: 'duration',
      label: findLabel(durationOptions, basicInfo.duration),
      icon: 'calendar',
    },
    {
      id: 'transport',
      label: `${findLabel(transportOptions, basicInfo.transport)} 코스`,
      icon: TRANSPORT_BADGE_ICON[basicInfo.transport],
    },
    {
      id: 'visitMonth',
      label: `${basicInfo.visitStartMonth}월 - ${basicInfo.visitEndMonth}월`,
      icon: 'calendar',
    },
    {
      id: 'companion',
      label: findLabel(companionOptions, basicInfo.companion),
      icon: COMPANION_BADGE_ICON[basicInfo.companion],
    },
  ];

  const stops: CourseStopDto[] = visitEvents.map((event, index) => ({
    id: index + 1,
    order: index + 1,
    name: event.name,
    address: event.address,
    hours: '',
    image: event.imageSrc || courseImage,
    liked: false,
    latitude: event.kind === 'PLACE' ? event.latitude : undefined,
    longitude: event.kind === 'PLACE' ? event.longitude : undefined,
  }));

  return {
    id: 'admin-course-preview',
    title: basicInfo.courseName,
    heroImageUrl: photo?.previewUrl || courseImage,
    liked: false,
    tags,
    infoBadges,
    overview: basicInfo.summary,
    stops,
    reviews: [],
  };
}
