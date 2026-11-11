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

// 스웨거 기준: 친구 요청 API. 요청 목록은 cursorId만으로 다음 페이지를 받는다.
export interface GetFriendRequestsParams {
  cursorId?: number;
  size?: number;
}

// GET /api/v1/friends/requests/received
export interface ReceivedFriendRequest {
  requestId: number;
  requester: FriendSummary;
  createdAt: string;
}

// GET /api/v1/friends/requests/sent
export interface SentFriendRequest {
  requestId: number;
  receiver: FriendSummary;
  createdAt: string;
}

export type GetReceivedFriendRequestsResponse =
  CursorResponse<ReceivedFriendRequest>;

export type GetSentFriendRequestsResponse = CursorResponse<SentFriendRequest>;

// PATCH /api/v1/friends/requests/{requestId}/accept
export interface AcceptFriendRequestResult {
  requestId: number;
  status: 'PENDING' | 'ACCEPTED';
  friend: FriendSummary;
}
