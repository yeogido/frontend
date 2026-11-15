import {
  getApiErrorMessage,
  normalizeApiError,
} from '../../../apis/common/apiError.ts';
import type {
  FriendProfile,
  FriendRelationStatus,
} from '../../../types/friend.type.ts';
import type { SearchRowAction } from './friendSearchRow.ts';

/** 주소의 friendUserId를 숫자로 바꾼다. 양의 정수가 아니면 null이다. */
export function parseFriendUserId(param: string | undefined): number | null {
  if (!param || !/^[1-9]\d*$/.test(param)) {
    return null;
  }

  const friendUserId = Number(param);

  return Number.isSafeInteger(friendUserId) ? friendUserId : null;
}

/** 이름 아래 줄. 친구면 이메일이 오고, 아니면(email이 없으면) 친구 코드를 보인다. */
export function getProfileSubtitle(
  profile: Pick<FriendProfile, 'email' | 'friendCode'>
): string {
  return profile.email?.trim() || profile.friendCode;
}

const ACTION_ARIA_LABELS: Record<
  SearchRowAction['kind'],
  (nickname: string) => string
> = {
  send: (nickname) => `${nickname} 친구 맺기`,
  requested: (nickname) => `${nickname} 친구 요청됨`,
  accept: (nickname) => `${nickname}의 친구 요청 수락`,
};

/** 화면에 보이는 버튼 문구를 포함하는 접근 가능한 이름. */
export function getProfileActionAriaLabel(
  kind: SearchRowAction['kind'],
  nickname: string
): string {
  return ACTION_ARIA_LABELS[kind](nickname);
}

interface RelationPatch {
  relationStatus: FriendRelationStatus;
  requestId?: number | null;
}

/** 캐시된 프로필의 관계를 바꾼다. 프로필이 없으면 그대로 둔다. */
export function patchFriendProfileRelation(
  profile: FriendProfile | undefined,
  patch: RelationPatch
): FriendProfile | undefined {
  if (!profile) {
    return profile;
  }

  return {
    ...profile,
    relationStatus: patch.relationStatus,
    requestId: patch.requestId ?? null,
  };
}

export type FriendProfileErrorKind = 'self' | 'not-found' | 'failed';

// 팀 Notion 기준: 내 ID로 조회하면 400 COMMON4002, 없는 사용자는 404 USER4041.
const PROFILE_ERROR_KINDS: Readonly<Record<string, FriendProfileErrorKind>> = {
  COMMON4002: 'self',
  USER4041: 'not-found',
};

export const PROFILE_LOAD_FAILURE_MESSAGE = '프로필을 불러오지 못했어요.';

/** 프로필 조회 실패를 화면이 다르게 처리할 종류로 나눈다. */
export function getFriendProfileErrorKind(
  error: unknown
): FriendProfileErrorKind {
  return PROFILE_ERROR_KINDS[normalizeApiError(error).code] ?? 'failed';
}

export function getFriendProfileFailureMessage(error: unknown): string {
  return getApiErrorMessage(error, PROFILE_LOAD_FAILURE_MESSAGE);
}
