import type { GetCoursesResponse } from '../../../types/course.type';

/** 선택한 조건 칩을 담아 두는 URL 쿼리 파라미터 이름 */
export const SEARCH_CONDITION_PARAM = 'condition';

/**
 * 서버가 검색 문장에서 뽑은 조건(extractedKeywords)을 칩으로 보여줄 목록으로
 * 정리한다. 페이지마다 같은 값이 내려오므로 첫 페이지 것만 쓰고, 빈 값과
 * 중복, 지금 검색어와 같은 조건은 뺀다. 지금 검색어와 같은 조건으로 더 찾으면
 * 첫 검색 결과를 모두 빼고 주므로 늘 빈 목록이 된다.
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

/**
 * URL에 담긴 조건이 지금 칩 목록에 있을 때만 선택된 조건으로 본다. 다른
 * 검색의 조건이 남아 있으면 서버가 COURSE4010으로 거절하므로 무시한다.
 */
export const getSelectedSearchCondition = (
  conditions: readonly string[],
  value: string | null
): string => {
  const condition = value?.trim() ?? '';

  return conditions.includes(condition) ? condition : '';
};

/**
 * 칩을 눌렀을 때의 다음 URL 파라미터. 다른 칩을 누르면 그 조건으로 바꾸고,
 * 이미 선택된 칩을 다시 누르면 선택을 푼다. 나머지 파라미터는 그대로 둔다.
 */
export const toggleSearchConditionParam = (
  searchParams: URLSearchParams,
  condition: string
): URLSearchParams => {
  const nextSearchParams = new URLSearchParams(searchParams);

  if (nextSearchParams.get(SEARCH_CONDITION_PARAM) === condition) {
    nextSearchParams.delete(SEARCH_CONDITION_PARAM);
  } else {
    nextSearchParams.set(SEARCH_CONDITION_PARAM, condition);
  }

  return nextSearchParams;
};
