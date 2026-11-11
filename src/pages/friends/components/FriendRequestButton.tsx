import type { ReactNode } from 'react';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px. scale은 useGlobalScale 값이다.
const BUTTON_HEIGHT = 32;
const BUTTON_PADDING_X = 12;
const BUTTON_PADDING_Y = 8;
const BUTTON_RADIUS = 8;
const BUTTON_TEXT_SIZE = 12;

const VARIANT_CLASS_NAMES = {
  accept: 'bg-main-3 text-main-5',
  neutral: 'border-gray-2 text-gray-4 border bg-white',
} as const;

interface FriendRequestButtonProps {
  variant: keyof typeof VARIANT_CLASS_NAMES;
  scale: number;
  disabled?: boolean;
  'aria-label': string;
  onClick: () => void;
  children: ReactNode;
}

/** 친구 요청 행의 오른쪽에 놓이는 수락·삭제·취소 버튼. */
function FriendRequestButton({
  variant,
  scale,
  disabled = false,
  'aria-label': ariaLabel,
  onClick,
  children,
}: FriendRequestButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`relative flex shrink-0 items-center justify-center font-medium before:absolute before:-inset-x-1 before:-inset-y-1 before:content-[''] disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASS_NAMES[variant]}`}
      style={{
        height: BUTTON_HEIGHT * scale,
        padding: `${BUTTON_PADDING_Y * scale}px ${BUTTON_PADDING_X * scale}px`,
        borderRadius: BUTTON_RADIUS * scale,
        fontSize: BUTTON_TEXT_SIZE * scale,
        lineHeight: 'normal',
      }}
    >
      {children}
    </button>
  );
}

export default FriendRequestButton;
