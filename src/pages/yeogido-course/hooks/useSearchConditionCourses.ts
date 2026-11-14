import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useCourses } from '../../../hooks/useCourses';
import { PRESERVE_SCROLL_STATE } from '../../../router/preserveScroll';
import type { GetCoursesResponse } from '../../../types/course.type';
import {
  SEARCH_CONDITION_PARAM,
  getCourseSearchConditions,
  getSelectedSearchCondition,
  toggleSearchConditionParam,
} from '../utils/searchConditions';

const PAGE_SIZE = 20;
/** searchId 유효 시간(1시간)이 지났을 때 서버가 주는 코드 */
const EXPIRED_SEARCH_CODE = 'COURSE4011';

interface UseSearchConditionCoursesParams {
  /** 첫 자연어 검색(keyword)의 응답 페이지 */
  firstSearchPages: readonly GetCoursesResponse[] | undefined;
  keyword: string;
  refetchFirstSearch: () => unknown;
}

/**
 * 자연어 검색 결과 하단의 조건 칩과, 칩으로 더 찾은 코스.
 *
 * 칩을 누르면 첫 검색의 searchId와 그 조건으로 추가 조회한다. 서버는 첫 검색의
 * 필터를 그대로 쓰고 첫 검색 결과에 있던 코스는 빼고 주므로, 화면은 첫 결과
 * 아래에 이어 붙인다. 선택한 조건은 URL(condition)에 둬서 상세에 다녀와도
 * 유지된다. searchId가 만료되면 첫 검색을 다시 받아 새 searchId로 조회한다.
 */
function useSearchConditionCourses({
  firstSearchPages,
  keyword,
  refetchFirstSearch,
}: UseSearchConditionCoursesParams) {
  const [searchParams, setSearchParams] = useSearchParams();
  const conditions = getCourseSearchConditions(firstSearchPages, keyword);
  const selectedCondition = getSelectedSearchCondition(
    conditions,
    searchParams.get(SEARCH_CONDITION_PARAM)
  );
  const searchId = firstSearchPages?.[0]?.searchId;

  const query = useCourses(
    {
      searchId,
      keywords: selectedCondition ? [selectedCondition] : undefined,
      size: PAGE_SIZE,
    },
    {
      enabled: Boolean(searchId && selectedCondition),
      // 창 포커스·뒤로가기로 첫 검색을 다시 받으면 searchId가 새로 발급돼 쿼리
      // 키가 바뀐다. 같은 조건이면 새 결과가 올 때까지 이전 목록을 보여준다.
      placeholderData: (previousData, previousQuery) =>
        previousQuery?.queryKey[2].keywords?.[0] === selectedCondition
          ? previousData
          : undefined,
    }
  );

  const isSearchExpired = query.error?.code === EXPIRED_SEARCH_CODE;
  const refreshedSearchIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // 같은 searchId로는 한 번만 다시 받는다(서버가 계속 만료라고 하면 멈춘다).
    if (
      !isSearchExpired ||
      !searchId ||
      refreshedSearchIdRef.current === searchId
    ) {
      return;
    }

    refreshedSearchIdRef.current = searchId;
    void refetchFirstSearch();
  }, [isSearchExpired, searchId, refetchFirstSearch]);

  /** 칩을 누르면 그 조건을 고르고, 선택된 칩을 다시 누르면 선택을 푼다. */
  const selectCondition = (condition: string) => {
    setSearchParams(toggleSearchConditionParam(searchParams, condition), {
      replace: true,
      state: PRESERVE_SCROLL_STATE,
    });
  };

  return {
    conditions,
    selectedCondition,
    selectCondition,
    courses: query.data?.pages.flatMap((page) => page.items) ?? [],
    // 만료되면 첫 검색을 다시 받는 중이므로 에러 대신 불러오는 중으로 본다.
    isPending: query.isPending || isSearchExpired,
    isError: query.isError && !isSearchExpired,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}

export default useSearchConditionCourses;
