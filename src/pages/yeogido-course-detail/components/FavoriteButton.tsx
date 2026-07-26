import { FaHeart as FilledHeartIcon } from 'react-icons/fa6';

import { MIN_TOUCH_TARGET } from '../../../constants/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { scaleValue } from '../../../utils/responsiveLayout';

// Figma 390 디자인 기준 리터럴 px
const BUTTON_SIZE = 44;
const ICON_SIZE = 32;

interface FavoriteButtonProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function FavoriteButton({ isActive, label, onClick }: FavoriteButtonProps) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      aria-label={`${label} 좋아요 ${isActive ? '취소' : '추가'}`}
      aria-pressed={isActive}
      onClick={onClick}
      className="flex items-center justify-center text-white drop-shadow-sm"
      style={{
        height: scaleValue(BUTTON_SIZE, scale, MIN_TOUCH_TARGET),
        width: scaleValue(BUTTON_SIZE, scale, MIN_TOUCH_TARGET),
      }}
    >
      <FilledHeartIcon
        className={`fill-current ${isActive ? 'text-main-5' : 'text-white'}`}
        style={{ height: ICON_SIZE * scale, width: ICON_SIZE * scale }}
      />
    </button>
  );
}

export default FavoriteButton;
