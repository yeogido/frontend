import { useGlobalScale } from '../../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const BUTTON_MARGIN_TOP = 50;
const BUTTON_HEIGHT = 54;
const BUTTON_TEXT_SIZE = 16;
const BUTTON_RADIUS = 12;

interface SubmitCourseButtonProps {
  onSubmit: () => void;
}

function SubmitCourseButton({ onSubmit }: SubmitCourseButtonProps) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      onClick={onSubmit}
      className="bg-main-5 w-full shrink-0 font-semibold text-white"
      style={{
        marginTop: BUTTON_MARGIN_TOP * scale,
        height: Math.max(BUTTON_HEIGHT * scale, 44),
        fontSize: Math.max(BUTTON_TEXT_SIZE * scale, 14),
        borderRadius: BUTTON_RADIUS * scale,
      }}
    >
      코스 등록하기
    </button>
  );
}

export default SubmitCourseButton;
