import { FaHeart as FilledHeartIcon } from 'react-icons/fa6';

import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const BUTTON_SIZE = 44;
const ICON_SIZE = 32;

export interface FavoriteButtonProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function FavoriteButton({
  isActive,
  label,
  onClick,
  disabled = false,
}: FavoriteButtonProps) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      aria-label={`${label} 좋아요 ${isActive ? '취소' : '추가'}`}
      aria-pressed={isActive}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center text-white drop-shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        height: BUTTON_SIZE * scale,
        width: BUTTON_SIZE * scale,
      }}
    >
      <FilledHeartIcon
        className={`fill-current ${isActive ? 'text-main-5' : 'text-white'}`}
        style={{ height: ICON_SIZE * scale, width: ICON_SIZE * scale }}
      />
    </button>
  );
}

export const DetailFavoriteButton = FavoriteButton;
export default FavoriteButton;
