const MAX_RETRY_COUNT = 1;

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
  ) {
    return error.status;
  }

  return undefined;
}

// QueryClient 기본값(3회, 1초·2초·4초 간격)을 그대로 두면 실패해도 약 7초
// 동안 스켈레톤만 보인다. 요청이 잘못됐거나(400) 대상이 없는(404) 경우는
// 다시 보내도 같은 응답이라 바로 실패로 보이고, 그 밖의 실패(네트워크, 5xx)만
// 한 번 더 시도한다.
export function shouldRetryFriendsQuery(
  failureCount: number,
  error: unknown
): boolean {
  const status = getErrorStatus(error);

  if (status !== undefined && status >= 400 && status < 500) {
    return false;
  }

  return failureCount < MAX_RETRY_COUNT;
}
