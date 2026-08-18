export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 10;
export const NICKNAME_LENGTH_ERROR_MESSAGE =
  '닉네임 길이는 2자 이상 10자 이하여야 합니다.';

export function getNicknameError(nickname: string): string | null {
  const length = nickname.trim().length;

  return length < NICKNAME_MIN_LENGTH || length > NICKNAME_MAX_LENGTH
    ? NICKNAME_LENGTH_ERROR_MESSAGE
    : null;
}
