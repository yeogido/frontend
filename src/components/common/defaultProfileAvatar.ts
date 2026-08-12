export const DEFAULT_PROFILE_AVATAR_BACKGROUND_COLOR = '#E4E4E4';

export function getDefaultProfileAvatarIconStyle(size: number) {
  return {
    top: (5 / 120) * size,
    width: size,
    height: (115 / 120) * size,
  };
}
