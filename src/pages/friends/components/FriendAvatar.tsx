import ProfileAvatar from '../../../components/common/ProfileAvatar';
import { getFriendAvatarColor } from '../utils/friendAvatarColor';

interface FriendAvatarProps {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  size: number;
}

function FriendAvatar({
  userId,
  nickname,
  profileImageUrl,
  size,
}: FriendAvatarProps) {
  return (
    <ProfileAvatar
      src={profileImageUrl}
      nickname={nickname}
      color={getFriendAvatarColor(userId)}
      size={size}
    />
  );
}

export default FriendAvatar;
