import type { CourseSummaryResult } from '../../../apis/courses';
import {
  findTransportLabel,
  toCompanionLabel,
  toDurationLabel,
} from '../../../utils/courseEnumLabels.ts';

export interface ReviewCourseCardData {
  readonly id: number | string;
  readonly title: string;
  readonly thumbnailUrl?: string;
  readonly duration: string;
  readonly transport: string;
  readonly companion: string;
}

function toTransportCourseLabel(transportType: string): string {
  const label = findTransportLabel(transportType);

  return label ? `${label} 코스` : transportType;
}

export function mapCourseSummaryToReviewCourse(
  course: CourseSummaryResult
): ReviewCourseCardData {
  return {
    id: course.courseId,
    title: course.title,
    thumbnailUrl: course.thumbnailUrl || undefined,
    duration: toDurationLabel(course.durationType),
    transport: toTransportCourseLabel(course.transportType),
    companion: toCompanionLabel(course.companionType),
  };
}
