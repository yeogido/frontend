// 훅 파일은 react-query를 import해서 Node 테스트 러너가 읽지 못한다.
// 쿼리 키 모양(['friends', userId, keyword])에 기대는 판단만 따로 두어 그대로 검증한다.
const USER_ID_KEY_INDEX = 1;

// 검색어만 바뀔 때는 이전 목록을 유지해 깜빡이지 않게 하고, 계정이 바뀌었으면
// 이전 계정의 목록이 잠깐이라도 보이지 않도록 버린다.
export function keepFriendsPlaceholderData<TData>(
  previousData: TData | undefined,
  previousQuery: { queryKey: readonly unknown[] } | undefined,
  userId: number | null
): TData | undefined {
  if (userId === null || !previousQuery) {
    return undefined;
  }

  return previousQuery.queryKey[USER_ID_KEY_INDEX] === userId
    ? previousData
    : undefined;
}
