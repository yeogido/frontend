import type { Course } from '../types/course.type';

export const RECENT_COURSES_STORAGE_KEY = 'recent-courses';
export const MAX_RECENT_COURSES = 10;

export function upsertRecentCourse(
  courses: readonly Course[],
  course: Course,
): Course[] {
  return [
    course,
    ...courses.filter((item) => item.courseId !== course.courseId),
  ].slice(0, MAX_RECENT_COURSES);
}

export function getStoredRecentCourses(): Course[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedCourses = window.localStorage.getItem(
      RECENT_COURSES_STORAGE_KEY,
    );

    if (!storedCourses) return [];

    const parsedCourses: unknown = JSON.parse(storedCourses);

    return Array.isArray(parsedCourses)
      ? parsedCourses.filter(isRecentCourse).slice(0, MAX_RECENT_COURSES)
      : [];
  } catch {
    return [];
  }
}

export function saveRecentCourse(course: Course): void {
  if (typeof window === 'undefined') return;

  try {
    const courses = upsertRecentCourse(getStoredRecentCourses(), course);

    window.localStorage.setItem(
      RECENT_COURSES_STORAGE_KEY,
      JSON.stringify(courses),
    );
  } catch {
    return;
  }
}

function isRecentCourse(value: unknown): value is Course {
  if (typeof value !== 'object' || value === null) return false;

  const course = value as Record<string, unknown>;

  return (
    typeof course.courseId === 'number' &&
    typeof course.title === 'string' &&
    typeof course.thumbnailUrl === 'string' &&
    typeof course.region === 'string' &&
    typeof course.durationType === 'string' &&
    typeof course.transportType === 'string' &&
    typeof course.companionType === 'string' &&
    Array.isArray(course.tags) &&
    course.tags.every((tag) => typeof tag === 'string') &&
    typeof course.isLiked === 'boolean'
  );
}
