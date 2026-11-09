import type { CursorResponse } from '../apis/common/apiTypes';

// 스웨거 기준: GET /api/v1/friends의 UserSummary
export interface FriendSummary {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  friendCode: string;
}

// 스웨거 기준: GET /api/v1/friends 쿼리 파라미터.
// keyword는 이름(부분 일치) 또는 친구코드(앞부분 일치)로 내 친구 안에서 찾는다.
export interface GetFriendsParams {
  keyword?: string;
  cursorNickname?: string;
  cursorId?: number;
  size?: number;
}

// 백엔드 확인 필요: 스웨거에 cursorValue 타입이 비어 있다. 다음 요청의
// cursorNickname으로 되돌려 보내는 값이라 닉네임 문자열로 가정한다.
export type GetFriendsResponse = CursorResponse<FriendSummary, string>;
