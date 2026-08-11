import { IoChevronBack } from 'react-icons/io5';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';

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
  const buttonSize = Math.max(MIN_TOUCH_TARGET, BACK_BUTTON_SIZE * scale);

  return (
    <button
      type="button"
      aria-label="뒤로가기"
      onClick={onClick}
      className="text-gray-5 flex items-center justify-center"
      style={{
        width: buttonSize,
        height: buttonSize,
        marginBottom: BACK_BUTTON_MARGIN_BOTTOM * scale,
        marginLeft: BACK_BUTTON_MARGIN_LEFT * scale,
      }}
    >
      <IoChevronBack
        aria-hidden="true"
        style={{ fontSize: BACK_ICON_SIZE * scale }}
      />
    </button>
  );
}

export default BackButton;
