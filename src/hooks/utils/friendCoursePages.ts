interface CoursePage<TCourse extends { courseId: number }> {
  items: TCourse[];
}

// 훅 파일은 react-query를 import해서 Node 테스트 러너가 읽지 못한다.
// 페이지 병합만 따로 두어 그대로 검증한다.

/** 코스 페이지를 하나의 목록으로 합친다. 같은 courseId는 앞에 나온 것만 남긴다. */
export function getFriendCoursesFromPages<TCourse extends { courseId: number }>(
  pages: readonly CoursePage<TCourse>[] | undefined
): TCourse[] {
  const seen = new Set<number>();
  const courses: TCourse[] = [];

  for (const page of pages ?? []) {
    for (const course of page.items) {
      if (!seen.has(course.courseId)) {
        seen.add(course.courseId);
        courses.push(course);
      }
    }
  }

  return courses;
}
