import { normalizeApiError } from '../../../apis/common/apiError.ts';

// 친구 삭제 API: 친구 관계가 없으면 FRIEND4043을 반환한다.
const FRIEND_NOT_FOUND_CODE = 'FRIEND4043';

/** 삭제하려던 사람이 이미 친구가 아닌 경우인지 본다. */
export function isFriendAlreadyDeletedError(error: unknown): boolean {
  return normalizeApiError(error).code === FRIEND_NOT_FOUND_CODE;
}
