import { courseImage } from '../../../detail/constants/courseDetailMock';
import type {
  CourseBadgeItem,
  CourseDetailDto,
  CourseStopDto,
} from '../../../detail/types/courseDetail';
import {
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
import { getDetailCompanionBadge } from '../../../detail/mappers/detailCompanionBadge';

const TRANSPORT_BADGE_ICON: Record<
  CourseBasicInfoValues['transport'],
  BadgeId
> = {
  walking: 'walk',
  car: 'car',
};

// getDetailCompanionBadge는 코스 상세(실제 등록된 코스)가 쓰는 API enum
// 값(SOLO·FRIEND…)을 받는데, 미리보기 폼의 값은 소문자(solo·friends…)라
// 여기서 변환한다 — 상세 화면과 같은 아이콘 매핑(companion-*)을 쓰기 위함.
const COMPANION_TYPE_TO_API: Record<CourseBasicInfoValues['companion'], string> =
  {
    solo: 'SOLO',
    friends: 'FRIEND',
    couple: 'COUPLE',
    family: 'FAMILY',
    pet: 'PET',
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
    (() => {
      const companion = getDetailCompanionBadge(
        COMPANION_TYPE_TO_API[basicInfo.companion]
      );

      return {
        id: 'companion' as const,
        label: companion.label,
        icon: companion.icon,
      };
    })(),
  ];

  const stops: CourseStopDto[] = visitEvents.map((event, index) => ({
    id: index + 1,
    order: index + 1,
    name: event.name,
    address: event.address,
    hours: '',
    image: event.imageSrc || courseImage,
    liked: false,
    timesFromPrevious: [],
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
