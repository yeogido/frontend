import type {
  FriendSummary,
  GetFriendsResponse,
} from '../../types/friend.type';

// 훅 파일은 react-query와 mock을 import해서 Node 테스트 러너가 읽지 못한다.
// 페이지를 하나의 목록으로 합치는 로직만 따로 두어 그대로 검증한다.
export function getFriendsFromPages(
  pages: readonly GetFriendsResponse[] | undefined
): FriendSummary[] {
  return pages?.flatMap((page) => page.items) ?? [];
}
