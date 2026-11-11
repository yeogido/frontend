import type { CursorResponse } from '../apis/common/apiTypes';

// 스웨거 기준: GET /api/v1/friends의 UserSummary
export interface FriendSummary {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  friendCode: string;
}

// GET /api/v1/friends 쿼리 파라미터 (스웨거와 팀 Notion '친구 목록 조회' 기준).
// keyword는 이름(부분 일치) 또는 친구코드로 내 친구 안에서만 찾는다.
// size는 기본값 10이고 양수여야 한다.
export interface GetFriendsParams {
  keyword?: string;
  cursorNickname?: string;
  cursorId?: number;
  size?: number;
}

// cursorValue는 마지막 항목의 닉네임이고, 다음 페이지를 받을 때
// cursorNickname으로 되돌려 보낸다 (팀 Notion '친구 목록 조회' 기준.
// 스웨거에는 cursorValue 타입이 비어 있다).
export type GetFriendsResponse = CursorResponse<FriendSummary, string>;

// 스웨거 기준: GET /api/v1/friends/me/code. qrToken은 발급 후 180초 동안 유효하다.
// 남은 시간은 qrExpiresAt이 아니라 응답을 받은 시각 + 180초로 계산하므로
// qrExpiresAt은 화면 계산에 쓰지 않는다.
export interface MyFriendCode {
  friendCode: string;
  qrToken: string;
  qrExpiresAt: string;
}
