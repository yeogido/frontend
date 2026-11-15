import { useState } from 'react';

import NicknameAvatar from '../../common/NicknameAvatar';
import { getFriendAvatarImageSrc } from '../../../pages/friends/utils/friendAvatarImage';

function AvatarContent({
  src,
  name,
  size,
}: {
  src: string | null;
  name: string;
  size: number;
}) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return <NicknameAvatar name={name} color="orange" size={size} />;
}

function DesktopOwnAvatar({
  src,
  name,
  size,
}: {
  src?: string | null;
  name: string;
  size: number;
}) {
  const safeSrc = getFriendAvatarImageSrc(src ?? null);
  return (
    <AvatarContent
      key={safeSrc ?? 'none'}
      src={safeSrc}
      name={name}
      size={size}
    />
  );
}

export default DesktopOwnAvatar;
