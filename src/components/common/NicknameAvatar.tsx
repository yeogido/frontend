import { getNicknameAvatarLabel } from './nicknameAvatarLabel';

const NICKNAME_AVATAR_GRADIENTS = {
  orange:
    'linear-gradient(180deg, var(--color-main-3) 0%, var(--color-main-4) 100%)',
  green:
    'linear-gradient(180deg, var(--color-green-1) 0%, var(--color-green-2) 100%)',
  purple:
    'linear-gradient(180deg, var(--color-blue-1) 0%, var(--color-blue-2) 100%)',
  blue: 'linear-gradient(180deg, var(--color-sky-1) 0%, var(--color-sky-2) 100%)',
} as const;

export type NicknameAvatarColor = keyof typeof NICKNAME_AVATAR_GRADIENTS;

export interface NicknameAvatarProps {
  name: string;
  /** 사용자에게 배정된 색상. 렌더링할 때마다 무작위로 변경하지 않는다. */
  color: NicknameAvatarColor;
  /** 디자인 기준 지름(px). */
  size: number;
  className?: string;
}

function NicknameAvatar({
  name,
  color,
  size,
  className = '',
}: NicknameAvatarProps) {
  const fullName = name.trim();

  return (
    <div
      role="img"
      aria-label={fullName ? `${fullName} 프로필` : '프로필'}
      title={fullName || undefined}
      className={`text-pure-white flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold whitespace-nowrap ${className}`}
      style={{
        width: size,
        height: size,
        background: NICKNAME_AVATAR_GRADIENTS[color],
        fontSize: size * (56 / 120),
        lineHeight: 'normal',
      }}
    >
      <span aria-hidden="true">{getNicknameAvatarLabel(name)}</span>
    </div>
  );
}

export default NicknameAvatar;
