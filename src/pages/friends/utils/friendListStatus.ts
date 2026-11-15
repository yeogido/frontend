interface LoadMoreErrorState {
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  friendCount: number;
}

// 다음 페이지를 받다 실패했을 때만 목록 아래에 안내를 띄운다. 삭제 뒤 목록을
// 다시 받다 실패한 경우도 isError는 true지만 isFetchNextPageError는 false라
// 여기서 걸러진다. 다시 시도하는 동안은 isFetchNextPageError가 true로 남으므로
// isFetchingNextPage로 가려서 스피너가 대신 보이게 한다.
export function shouldShowLoadMoreError({
  isFetchNextPageError,
  isFetchingNextPage,
  friendCount,
}: LoadMoreErrorState): boolean {
  return isFetchNextPageError && !isFetchingNextPage && friendCount > 0;
}

interface AutoLoadState {
  hasNextPage: boolean | undefined;
  isPending: boolean;
  isError: boolean;
}

// isError를 빼면 실패 직후 센티널이 아직 보이는 동안 같은 요청을 곧바로 다시
// 보내 끝없이 반복한다. 실패한 뒤에는 다시 시도 버튼으로만 이어 간다.
export function canLoadMoreAutomatically({
  hasNextPage,
  isPending,
  isError,
}: AutoLoadState): boolean {
  return Boolean(hasNextPage) && !isPending && !isError;
}
