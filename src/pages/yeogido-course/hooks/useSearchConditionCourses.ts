import { useEffect, useRef, useState } from 'react';
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
/** 만료된 searchId 하나를 복구(첫 검색 다시 받기)하려고 시도하는 최대 횟수 */
const MAX_RECOVERY_ATTEMPTS = 2;

interface UseSearchConditionCoursesParams {
  /** 첫 자연어 검색(keyword)의 응답 페이지 */
  firstSearchPages: readonly GetCoursesResponse[] | undefined;
  keyword: string;
  /** 첫 검색을 다시 받는다. 끝나면 그때의 첫 검색 결과를 돌려준다. */
  refetchFirstSearch: () => Promise<{
    data?: { pages: readonly GetCoursesResponse[] };
  }>;
}

interface FailedRecovery {
  searchId: string;
  count: number;
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
  // 복구 중이거나 복구를 마친 searchId — 같은 searchId로 겹쳐 다시 받지 않는다.
  const recoveringSearchIdRef = useRef<string | undefined>(undefined);
  const [failedRecovery, setFailedRecovery] = useState<FailedRecovery | null>(
    null
  );
  const failedRecoveryCount =
    failedRecovery && failedRecovery.searchId === searchId
      ? failedRecovery.count
      : 0;
  const canRecover = failedRecoveryCount < MAX_RECOVERY_ATTEMPTS;

  useEffect(() => {
    if (
      !isSearchExpired ||
      !searchId ||
      !canRecover ||
      recoveringSearchIdRef.current === searchId
    ) {
      return;
    }

    recoveringSearchIdRef.current = searchId;
    void refetchFirstSearch().then((result) => {
      // 새 searchId를 받았으면 복구 완료 — 쿼리 키가 바뀌어 추가 조회를 다시 한다.
      if (result.data?.pages[0]?.searchId !== searchId) return;

      // 갱신이 취소되거나 실패해 searchId가 그대로면, 같은 searchId로 다시
      // 시도할 수 있게 풀어 둔다. 횟수가 바뀌면 이 effect가 다시 실행된다.
      recoveringSearchIdRef.current = undefined;
      setFailedRecovery((previous) => ({
        searchId,
        count: (previous?.searchId === searchId ? previous.count : 0) + 1,
      }));
    });
  }, [
    isSearchExpired,
    searchId,
    canRecover,
    failedRecoveryCount,
    refetchFirstSearch,
  ]);

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
    // 복구를 정해진 횟수만큼 실패하면 그때는 에러로 보여준다.
    isPending: query.isPending || (isSearchExpired && canRecover),
    isError: query.isError && (!isSearchExpired || !canRecover),
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    /** 다시 시도 — searchId 만료로 실패했으면 첫 검색 복구부터 다시 한다. */
    refetch: () => {
      if (isSearchExpired) {
        setFailedRecovery(null);
        return;
      }

      void query.refetch();
    },
  };
}

export default useSearchConditionCourses;
