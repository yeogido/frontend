import { IoChevronBack } from 'react-icons/io5';

import { useGlobalScale } from '../../hooks/useGlobalScale';

const BACK_BUTTON_SIZE = 32;
const BACK_BUTTON_MARGIN_BOTTOM = 16;
const BACK_BUTTON_MARGIN_LEFT = -8;
const BACK_ICON_SIZE = 30;
const MIN_TOUCH_TARGET = 44;

interface BackButtonProps {
  onClick: () => void;
}

function BackButton({ onClick }: BackButtonProps) {
  const scale = useGlobalScale();
  const s = (value: number) => value * scale;
  const buttonSize = Math.max(MIN_TOUCH_TARGET, s(BACK_BUTTON_SIZE));

  return (
    <button
      type="button"
      aria-label="뒤로가기"
      onClick={onClick}
      className="text-gray-5 flex items-center justify-center"
      style={{
        width: buttonSize,
        height: buttonSize,
        marginBottom: s(BACK_BUTTON_MARGIN_BOTTOM),
        marginLeft: s(BACK_BUTTON_MARGIN_LEFT),
      }}
    >
      <IoChevronBack aria-hidden="true" style={{ fontSize: s(BACK_ICON_SIZE) }} />
    </button>
  );
}

export default BackButton;
