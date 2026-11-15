import type { CursorResponse } from '../apis/common/apiTypes';
import type { Course } from './course.type';
import type {
  TravelRecordApiVisibility,
  TravelRecordImageResponse,
  TravelRecordStickerResponse,
  TravelRecordYearListResponse,
} from './travelRecord.type';

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
// 백엔드 배포 전에는 friendCode만 오므로 qrToken과 qrExpiresAt은 없을 수 있다.
// 남은 시간은 qrExpiresAt이 아니라 요청을 시작한 시각 + 180초로 계산하므로
// qrExpiresAt은 화면 계산에 쓰지 않는다.
export interface MyFriendCode {
  friendCode: string;
  qrToken?: string | null;
  qrExpiresAt?: string | null;
}

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

// GET /api/v1/friends/search의 relationStatus
export type FriendRelationStatus = 'NONE' | 'REQUESTED' | 'RECEIVED' | 'FRIEND';

// GET /api/v1/friends/search (팀 Notion '친구 검색' 기준). email은 FRIEND일 때만,
// requestId는 REQUESTED와 RECEIVED일 때만 내려온다.
export interface SearchedFriend extends FriendSummary {
  email?: string | null;
  relationStatus: FriendRelationStatus;
  requestId?: number | null;
}

// keyword는 이름 또는 친구 코드와 정확히 일치한 사용자만 찾는다. 다음 페이지는
// cursorId만으로 받는다.
export interface SearchFriendsParams {
  keyword: string;
  cursorId?: number;
  size?: number;
}

export type SearchFriendsResponse = CursorResponse<SearchedFriend>;

// POST /api/v1/friends/requests
export interface SendFriendRequestBody {
  friendCode: string;
}

export interface SendFriendRequestResult {
  requestId: number;
  receiver: FriendSummary;
  status: 'PENDING';
  createdAt: string;
}

// GET /api/v1/friends/{friendUserId} (팀 Notion 기준). 친구가 아니어도 조회할 수
// 있고, email은 친구일 때만 내려온다. requestId는 REQUESTED와 RECEIVED일 때만 있다.
export interface FriendProfile {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  friendCode: string;
  email: string | null;
  region?: { regionId: number; name: string } | null;
  relationStatus: FriendRelationStatus;
  requestId: number | null;
}

// GET /api/v1/friends/{friendUserId}/courses/local. 다음 페이지는 cursorId만으로 받는다.
export interface GetFriendLocalCoursesParams {
  cursorId?: number;
  size?: number;
}

export type GetFriendLocalCoursesResponse = CursorResponse<Course>;

// GET /api/v1/friends/{friendUserId}/travel-map. blurred가 true인 항목은 지역, 좌표,
// 날짜만 의미가 있고 title, visibility, images는 null이다(친구에게만 내려온다).
export interface FriendTravelMapItem {
  blurred: boolean;
  travelRecordId: number;
  regionId: number;
  regionName: string;
  latitude: number | null;
  longitude: number | null;
  startDate: string;
  endDate: string;
  title: string | null;
  visibility: TravelRecordApiVisibility | null;
  images: TravelRecordImageResponse[] | null;
}

// size는 최대 100이다. year를 생략했을 때 전체를 주는지는 확인하지 못했다.
export interface GetFriendTravelMapParams {
  cursor?: number;
  size?: number;
  year?: number;
}

export type GetFriendTravelMapResponse = CursorResponse<
  FriendTravelMapItem,
  unknown
>;

// GET /api/v1/friends/{friendUserId}/travel-map/years. 최신순이다.
export interface GetFriendTravelMapYearsResponse {
  years: number[];
}

// GET /api/v1/travel-records?userId={친구}. 내 목록과 같은 엔드포인트라 목록에는
// permissions, version이 없다. previewImages는 최대 2장이고 stickers의 모양은
// 상세와 같다고 보지만 확인하지 못해서 필드가 빠진 항목은 매퍼가 건너뛴다.
export interface FriendTravelRecordItem {
  travelRecordId: number;
  title: string;
  regionId: number;
  startDate: string;
  endDate: string;
  coverImageUrl: string | null;
  folderTheme: string;
  visibility: TravelRecordApiVisibility | null;
  previewImages?:
    Pick<TravelRecordImageResponse, 'imageUrl' | 'imageOrder'>[] | null;
  stickers?: Partial<TravelRecordStickerResponse>[] | null;
  createdAt?: string;
}

// year를 생략하면 서버 기본은 현재 연도다. 첫 요청은 cursor를 비운다.
export interface GetFriendTravelRecordsParams {
  year?: number;
  cursor?: number;
  size?: number;
}

export type GetFriendTravelRecordsResponse = CursorResponse<
  FriendTravelRecordItem,
  unknown
>;

// GET /api/v1/travel-records/years?userId={친구}. 최신순이고 없으면 빈 배열이다.
export type GetFriendTravelRecordYearsResponse = TravelRecordYearListResponse;
