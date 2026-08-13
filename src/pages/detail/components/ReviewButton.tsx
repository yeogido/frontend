import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const BUTTON_HEIGHT = 53;
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
          height: BUTTON_HEIGHT * scale,
          borderRadius: BUTTON_RADIUS * scale,
          fontSize: BUTTON_FONT_SIZE * scale,
        }}
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
}

export default ReviewButton;
