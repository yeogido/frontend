import type { Course, CourseType } from '../types/course.type';

export const RECENT_COURSES_STORAGE_KEY = 'recent-courses';
export const MAX_RECENT_COURSES = 10;

// 여기도(OFFICIAL)/우리동네(LOCAL) 코스를 같은 저장소에 함께 기록하되,
// 화면별로 자신의 courseType만 걸러 보여줄 수 있도록 태그를 붙여 저장한다.
export interface RecentCourse extends Course {
  courseType: CourseType;
}

export function upsertRecentCourse(
  courses: readonly RecentCourse[],
  course: RecentCourse,
): RecentCourse[] {
  return [
    course,
    ...courses.filter((item) => item.courseId !== course.courseId),
  ].slice(0, MAX_RECENT_COURSES);
}

export function getStoredRecentCourses(): RecentCourse[] {
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

export function saveRecentCourse(course: RecentCourse): void {
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

export function updateRecentCourseLikeState(
  courseId: number,
  isLiked: boolean,
): void {
  if (typeof window === 'undefined') return;

  try {
    const courses = getStoredRecentCourses();

    if (!courses.some((course) => course.courseId === courseId)) return;

    const updatedCourses = courses.map((course) =>
      course.courseId === courseId ? { ...course, isLiked } : course,
    );

    window.localStorage.setItem(
      RECENT_COURSES_STORAGE_KEY,
      JSON.stringify(updatedCourses),
    );
  } catch {
    return;
  }
}

function isRecentCourse(value: unknown): value is RecentCourse {
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
    typeof course.isLiked === 'boolean' &&
    (course.courseType === 'OFFICIAL' || course.courseType === 'LOCAL')
  );
}
