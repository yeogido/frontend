import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { getGutter } from '../../../utils/responsiveLayout';

// Figma 390 디자인 기준 리터럴 px
const TOAST_BOTTOM = 84;
const TOAST_TEXT_PADDING_X = 16;
const TOAST_TEXT_PADDING_Y = 8;
const TOAST_TEXT_FONT_SIZE = 13;
const TOAST_RADIUS = 999;

export interface ShareToastProps {
  readonly copied: boolean;
  readonly isToastVisible: boolean;
  readonly message?: string;
}

export function ShareToast({
  copied,
  isToastVisible,
  message = '복사됨',
}: ShareToastProps) {
  const scale = useGlobalScale();

  if (!copied) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-1/2 z-[60] flex w-full max-w-[500px] -translate-x-1/2 justify-center"
      style={{
        bottom: `max(${TOAST_BOTTOM * scale}px, env(safe-area-inset-bottom, 0px))`,
        paddingLeft: getGutter(scale),
        paddingRight: getGutter(scale),
      }}
    >
      <span
        role="status"
        className={`bg-gray-800 text-center font-medium text-white shadow-lg transition-all duration-300 ${
          isToastVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          paddingLeft: TOAST_TEXT_PADDING_X * scale,
          paddingRight: TOAST_TEXT_PADDING_X * scale,
          paddingTop: TOAST_TEXT_PADDING_Y * scale,
          paddingBottom: TOAST_TEXT_PADDING_Y * scale,
          fontSize: TOAST_TEXT_FONT_SIZE * scale,
          borderRadius: TOAST_RADIUS * scale,
        }}
      >
        {message}
      </span>
    </div>
  );
}

export default ShareToast;
