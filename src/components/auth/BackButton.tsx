import { IoChevronBack } from 'react-icons/io5';

const BACK_BUTTON_SIZE = 32;
const BACK_BUTTON_MARGIN_BOTTOM = 16;
const BACK_BUTTON_MARGIN_LEFT = -8;
const BACK_ICON_SIZE = 30;
const MIN_TOUCH_TARGET = 44;

interface BackButtonProps {
  onClick: () => void;
}

function BackButton({ onClick }: BackButtonProps) {
  const buttonSize = Math.max(MIN_TOUCH_TARGET, BACK_BUTTON_SIZE);

  return (
    <button
      type="button"
      aria-label="뒤로가기"
      onClick={onClick}
      className="text-gray-5 flex items-center justify-center"
      style={{
        width: buttonSize,
        height: buttonSize,
        marginBottom: BACK_BUTTON_MARGIN_BOTTOM,
        marginLeft: BACK_BUTTON_MARGIN_LEFT,
      }}
    >
      <IoChevronBack aria-hidden="true" style={{ fontSize: BACK_ICON_SIZE }} />
    </button>
  );
}

export default BackButton;
