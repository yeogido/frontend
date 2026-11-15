/** 검색 입력을 API keyword로 바꾼다. 비어 있으면 undefined라 쿼리에서 빠진다. */
export function toFriendKeyword(input: string): string | undefined {
  const keyword = input.trim();

  return keyword.length > 0 ? keyword : undefined;
}
