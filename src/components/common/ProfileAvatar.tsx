import { useState } from 'react';
import NicknameAvatar, { type NicknameAvatarColor } from './NicknameAvatar';

import profileIcon from '../../assets/icons/profile.svg';

import {
  DEFAULT_PROFILE_AVATAR_BACKGROUND_COLOR,
  getDefaultProfileAvatarIconStyle,
} from './defaultProfileAvatar';

export interface ProfileAvatarProps {
  src?: string | null;
  size: number;
  className?: string;
  nickname?: string;
  color?: NicknameAvatarColor;
}

function ProfileAvatarImage({
  src,
  size,
  className = '',
  nickname,
  color = 'orange',
}: ProfileAvatarProps) {
  const [hasFailed, setHasFailed] = useState(false);

  const style = { width: size, height: size };

  if (src?.trim() && !hasFailed) {
    return (
      <img
        src={src.trim()}
        alt=""
        aria-hidden="true"
        onError={() => setHasFailed(true)}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={style}
      />
    );
  }

  if (nickname?.trim()) {
    return (
      <NicknameAvatar
        name={nickname}
        color={color}
        size={size}
        className={className}
      />
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${className}`}
      style={{
        ...style,
        backgroundColor: DEFAULT_PROFILE_AVATAR_BACKGROUND_COLOR,
      }}
      aria-hidden="true"
    >
      <img
        src={profileIcon}
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2"
        style={getDefaultProfileAvatarIconStyle(size)}
      />
    </div>
  );
}

function ProfileAvatar({
  src,
  size,
  className = '',
  nickname,
  color,
}: ProfileAvatarProps) {
  return (
    <ProfileAvatarImage
      key={src ?? 'default'}
      src={src ?? ''}
      size={size}
      className={className}
      nickname={nickname}
      color={color}
    />
  );
}

export default ProfileAvatar;
