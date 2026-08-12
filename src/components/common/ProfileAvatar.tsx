import { useState } from 'react';

import profileIcon from '../../assets/icons/profile.svg';

import {
  DEFAULT_PROFILE_AVATAR_BACKGROUND_COLOR,
  getDefaultProfileAvatarIconStyle,
} from './defaultProfileAvatar';

export interface ProfileAvatarProps {
  src?: string | null;
  size: number;
  className?: string;
}

function ProfileAvatarImage({ src, size, className }: Required<ProfileAvatarProps>) {
  const [hasFailed, setHasFailed] = useState(false);

  const style = { width: size, height: size };

  if (src && !hasFailed) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        onError={() => setHasFailed(true)}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ ...style, backgroundColor: DEFAULT_PROFILE_AVATAR_BACKGROUND_COLOR }}
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

function ProfileAvatar({ src, size, className = '' }: ProfileAvatarProps) {
  return (
    <ProfileAvatarImage
      key={src ?? 'default'}
      src={src ?? ''}
      size={size}
      className={className}
    />
  );
}

export default ProfileAvatar;
