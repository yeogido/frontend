import type { RecentCultureContent } from '../../types/content.type';
import type { RecentCourse } from '../../utils/recentCourses';

export type RecentViewedItem =
  | { kind: 'course'; viewedAt: number; course: RecentCourse }
  | { kind: 'content'; viewedAt: number; content: RecentCultureContent };

/**
 * 코스와 행사를 본 시각 최신순으로 한 목록에 섞는다.
 *
 * 본 시각(viewedAt)이 생기기 전에 저장된 항목은 0으로 보고 맨 뒤로 보낸다.
 * 값이 같으면 코스가 먼저, 같은 종류끼리는 저장된 순서(최신이 앞)를 지킨다.
 */
export function mergeRecentViewed(
  courses: readonly RecentCourse[],
  contents: readonly RecentCultureContent[]
): RecentViewedItem[] {
  const items: RecentViewedItem[] = [
    ...courses.map((course) => ({
      kind: 'course' as const,
      viewedAt: course.viewedAt ?? 0,
      course,
    })),
    ...contents.map((content) => ({
      kind: 'content' as const,
      viewedAt: content.viewedAt ?? 0,
      content,
    })),
  ];

  return items.sort((a, b) => b.viewedAt - a.viewedAt);
}
