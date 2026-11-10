import type { GetCoursesResponse } from '../../../types/course.type';

/**
 * 서버가 검색 문장에서 뽑은 조건(extractedKeywords)을 칩으로 보여줄 목록으로
 * 정리한다. 페이지마다 같은 값이 내려오므로 첫 페이지 것만 쓰고, 빈 값과
 * 중복, 눌러도 같은 검색이 되는 지금 검색어와 같은 조건은 뺀다.
 */
export const getCourseSearchConditions = (
  pages: readonly Pick<GetCoursesResponse, 'extractedKeywords'>[] | undefined,
  currentKeyword = ''
): string[] => {
  const keywords = pages?.[0]?.extractedKeywords ?? [];
  const searchedKeyword = currentKeyword.trim();
  const conditions: string[] = [];

  for (const keyword of keywords) {
    const condition = keyword.trim();

    if (
      condition &&
      condition !== searchedKeyword &&
      !conditions.includes(condition)
    ) {
      conditions.push(condition);
    }
  }

  return conditions;
};
