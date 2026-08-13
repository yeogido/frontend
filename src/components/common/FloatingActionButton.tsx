import { createPortal } from 'react-dom';

import addIcon from '../../assets/icons/material-symbols_add-2-rounded.svg';
import { APP_MAX_WIDTH, GLOBAL_DESIGN_WIDTH } from '../../constants/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';

const BUTTON_SIZE = 56;
const BUTTON_BOTTOM = 40;
const BUTTON_RIGHT = 24;
const ICON_SIZE = 32;

interface FloatingActionButtonProps {
  ariaLabel: string;
  onClick: () => void;
  bottomOffset?: number;
  className?: string;
}

function FloatingActionButton({
  ariaLabel,
  onClick,
  bottomOffset = BUTTON_BOTTOM,
  className = '',
}: FloatingActionButtonProps) {
  const scale = useGlobalScale();
  const button = (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`fixed z-30 flex items-center justify-center rounded-full bg-[#1C1C1C] ${className}`}
      style={{
        right: `max(${BUTTON_RIGHT * scale}px, calc((100% - ${APP_MAX_WIDTH}px) / 2 + ${BUTTON_RIGHT * (APP_MAX_WIDTH / GLOBAL_DESIGN_WIDTH)}px))`,
        bottom: bottomOffset * scale,
        width: BUTTON_SIZE * scale,
        height: BUTTON_SIZE * scale,
      }}
    >
      <img
        src={addIcon}
        alt=""
        aria-hidden="true"
        style={{ width: ICON_SIZE * scale, height: ICON_SIZE * scale }}
      />
    </button>
  );

  return typeof document === 'undefined'
    ? button
    : createPortal(button, document.body);
}

export default FloatingActionButton;
