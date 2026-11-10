import { useState } from 'react';

import NicknameAvatar from '../../../components/common/NicknameAvatar';
import { getFriendAvatarColor } from '../utils/friendAvatarColor';
import { getFriendAvatarImageSrc } from '../utils/friendAvatarImage';

interface FriendAvatarProps {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  /** 디자인 기준 지름(px)에 scale을 곱한 값. */
  size: number;
}

interface FriendAvatarContentProps extends Omit<
  FriendAvatarProps,
  'profileImageUrl'
> {
  src: string | null;
}

function FriendAvatarContent({
  userId,
  nickname,
  src,
  size,
}: FriendAvatarContentProps) {
  const [hasFailed, setHasFailed] = useState(false);

  // 닉네임이 바로 옆에 나오므로 사진은 읽어 줄 필요가 없다.
  if (src && !hasFailed) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        onError={() => setHasFailed(true)}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <NicknameAvatar
      name={nickname}
      color={getFriendAvatarColor(userId)}
      size={size}
    />
  );
}

/**
 * 프로필 사진이 있으면 사진을, 없거나 불러오지 못하면 이름 글자 아바타를 보여 준다.
 */
function FriendAvatar({
  userId,
  nickname,
  profileImageUrl,
  size,
}: FriendAvatarProps) {
  const src = getFriendAvatarImageSrc(profileImageUrl);

  // 주소가 바뀌면 이전 주소의 실패 상태를 버린다.
  return (
    <FriendAvatarContent
      key={src ?? 'none'}
      userId={userId}
      nickname={nickname}
      src={src}
      size={size}
    />
  );
}

export default FriendAvatar;
