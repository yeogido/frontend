import { toContentTagIds } from './contentTags';
import {
  toCompanionLabel,
  toDurationLabel,
  toTransportLabel,
} from './courseEnumLabels.ts';

import type { Course } from '../types/course.type';

export function toCourseCardProps(course: Course) {
  return {
    id: course.courseId,
    image: course.routeImageUrl?.trim() || course.thumbnailUrl,
    title: course.title,
    duration: toDurationLabel(course.durationType),
    courseType: toTransportLabel(course.transportType),
    companion: toCompanionLabel(course.companionType),
    tags: toContentTagIds(course.tags),
    liked: course.isLiked,
  };
}
