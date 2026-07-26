import { MIN_TOUCH_TARGET } from '../../constants/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { scaleValue } from '../../utils/responsiveLayout';

// Figma 390 디자인 기준 리터럴 px
const BUTTON_HEIGHT = 52;
const BUTTON_RADIUS = 14;
const BUTTON_FONT_SIZE = 18;

export interface ReviewButtonProps {
  readonly label?: string;
  readonly onClick?: () => void;
  readonly className?: string;
}

export function ReviewButton({
  label = '리뷰 작성하기',
  onClick,
  className = '',
}: ReviewButtonProps) {
  const scale = useGlobalScale();

  return (
    <div className={`flex w-full ${className}`}>
      <button
        type="button"
        className="bg-main-5 w-full font-bold text-white active:scale-[0.99]"
        style={{
          height: scaleValue(BUTTON_HEIGHT, scale, MIN_TOUCH_TARGET),
          borderRadius: BUTTON_RADIUS * scale,
          fontSize: scaleValue(BUTTON_FONT_SIZE, scale, 14),
        }}
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
}

export default ReviewButton;
