import type { NicknameAvatarColor } from '../../../components/common/NicknameAvatar';

const FRIEND_AVATAR_COLORS = [
  'orange',
  'green',
  'purple',
  'blue',
] as const satisfies readonly NicknameAvatarColor[];

export function getFriendAvatarColor(userId: number): NicknameAvatarColor {
  if (!Number.isFinite(userId)) {
    return FRIEND_AVATAR_COLORS[0];
  }

  const count = FRIEND_AVATAR_COLORS.length;
  const index = ((Math.trunc(userId) % count) + count) % count;

  return FRIEND_AVATAR_COLORS[index];
}
