import { toContentTagIds } from './contentTags';
import { toCompanionLabel, toDurationLabel } from './courseEnumLabels.ts';

import type { Course } from '../types/course.type';

export function toCourseCardProps(course: Course) {
  return {
    id: course.courseId,
    image: course.routeImageUrl?.trim() || course.thumbnailUrl,
    title: course.title,
    duration: toDurationLabel(course.durationType),
    courseType: course.region,
    companion: toCompanionLabel(course.companionType),
    tags: toContentTagIds(course.tags),
    liked: course.isLiked,
  };
}
