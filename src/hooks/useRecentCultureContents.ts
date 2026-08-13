import { useEffect, useState } from 'react';
import { useQueries } from '@tanstack/react-query';

import { normalizeApiError } from '../apis/common';
import { getCultureContentDetail } from '../apis/contents.api';
import {
  RECENT_CULTURE_CONTENTS_UPDATED_EVENT,
  getStoredRecentCultureContents,
  removeRecentCultureContent,
} from '../utils/recentCultureContents';
import { useAuthStore } from '../store/auth.store';

const CONTENT_NOT_FOUND_CODE = 'CONTENT4041';
// 목록이 최대 10개라 요청 수가 묶여 있고, 한 번 확인한 행사는 이 시간 동안
// 다시 묻지 않는다. 코스 쪽(useRecentCourses)과 같은 1분으로 맞춘다.
const VALIDATION_STALE_TIME = 60_000;

/**
 * 삭제된 행사인지 판단한다. status가 아니라 콘텐츠 코드만 본다 — 본문에
 * code가 없는 404는 배포 중이거나 경로가 틀렸을 때도 나오는데, 그것까지
 * 삭제로 단정하면 일시적 장애에 목록이 지워진다.
 */
const isContentNotFoundError = (error: unknown) =>
  normalizeApiError(error).code === CONTENT_NOT_FOUND_CODE;

function useStoredRecentCultureContents() {
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const [recentCultureContents, setRecentCultureContents] = useState(
    getStoredRecentCultureContents
  );
  const [storedAuthGeneration, setStoredAuthGeneration] =
    useState(authGeneration);

  if (storedAuthGeneration !== authGeneration) {
    setStoredAuthGeneration(authGeneration);
    setRecentCultureContents(getStoredRecentCultureContents());
  }

  useEffect(() => {
    const handleUpdate = () =>
      setRecentCultureContents(getStoredRecentCultureContents());

    window.addEventListener(RECENT_CULTURE_CONTENTS_UPDATED_EVENT, handleUpdate);

    return () =>
      window.removeEventListener(
        RECENT_CULTURE_CONTENTS_UPDATED_EVENT,
        handleUpdate
      );
  }, []);

  return recentCultureContents;
}

/**
 * "최근 본 행사" 목록. 삭제된 행사를 걷어내는 이유는
 * useRecentCourses의 주석 참고.
 */
export function useRecentCultureContents() {
  const recentCultureContents = useStoredRecentCultureContents();

  const validations = useQueries({
    queries: recentCultureContents.map((content) => ({
      queryKey: ['cultureContent', content.contentId],
      queryFn: () => getCultureContentDetail(content.contentId),
      staleTime: VALIDATION_STALE_TIME,
      retry: false,
      refetchOnWindowFocus: false,
    })),
  });

  const deletedContentIds = recentCultureContents
    .filter((_, index) => isContentNotFoundError(validations[index]?.error))
    .map((content) => content.contentId);
  // 배열을 그대로 의존성에 넣으면 매 렌더 새 참조라 무한 루프가 된다.
  const deletedContentIdKey = deletedContentIds.join(',');

  useEffect(() => {
    if (!deletedContentIdKey) return;

    deletedContentIdKey.split(',').forEach((contentId) => {
      removeRecentCultureContent(Number(contentId));
    });
  }, [deletedContentIdKey]);

  if (deletedContentIds.length === 0) {
    return recentCultureContents;
  }

  return recentCultureContents.filter(
    (content) => !deletedContentIds.includes(content.contentId)
  );
}

/**
 * 상세 화면이 "삭제된 행사" 응답을 받으면 최근 목록에서도 지운다.
 * 이유는 useRecentCourses의 useRemoveDeletedRecentCourse 주석 참고.
 */
export function useRemoveDeletedRecentCultureContent(
  contentId: number | null,
  error: unknown
) {
  const deletedContentId =
    contentId !== null && isContentNotFoundError(error) ? contentId : null;

  useEffect(() => {
    if (deletedContentId === null) return;

    removeRecentCultureContent(deletedContentId);
  }, [deletedContentId]);
}
