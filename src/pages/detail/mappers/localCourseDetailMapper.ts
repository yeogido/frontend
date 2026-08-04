import { tagDefinitionMap } from '../../../constants/tags';
import type { BadgeId } from '../../../constants/badges';
import type { DetailTag } from '../../../types/detail';
import type { LocalCourse } from '../../../types/localCourse.type';
import type { CourseDetailDto } from '../types/courseDetail';

function toDetailTags(tagIds: LocalCourse['tags']): DetailTag[] {
  return tagIds.map((tagId, index) => ({
    id: index,
    tagId,
    label: tagDefinitionMap[tagId].label,
  }));
}

function toCourseTypeIcon(courseType: string): BadgeId {
  return courseType.includes('뚜벅이') ? 'walk' : 'car';
}

function toCompanionIcon(companion: string): BadgeId {
  return companion === '혼자' ? 'solo' : 'group';
}

import { courseDetailMockData } from '../constants/courseDetailMock';

export function mapLocalCourseToDetailDto(
  course: LocalCourse
): CourseDetailDto {
  return {
    id: course.id,
    title: course.title,
    heroImageUrl: course.image,
    liked: course.liked,
    tags: toDetailTags(course.tags),
    infoBadges: [
      { id: 1, label: course.duration, icon: 'calendar' },
      {
        id: 2,
        label: course.courseType,
        icon: toCourseTypeIcon(course.courseType),
      },
      {
        id: 3,
        label: course.companion,
        icon: toCompanionIcon(course.companion),
      },
      { id: 4, label: '동네 코스', icon: 'favorite' },
    ],
    overview: `${course.title}\n${course.companion} 떠나기 좋은 ${course.duration} ${course.courseType}입니다.`,
    stops: courseDetailMockData.stops,
    reviews: courseDetailMockData.reviews,
  };
}
