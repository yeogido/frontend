import { useGlobalScale } from '../../../../hooks/useGlobalScale';

const BUTTON_MARGIN_TOP = 50;
const BUTTON_HEIGHT = 54;
const BUTTON_TEXT_SIZE = 16;
const BUTTON_RADIUS = 12;

interface SubmitCourseButtonProps {
  isUploading: boolean;
  onSubmit: () => void;
}

function SubmitCourseButton({
  isUploading,
  onSubmit,
}: SubmitCourseButtonProps) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={isUploading}
      className="bg-main-5 w-full shrink-0 font-semibold text-white disabled:opacity-60"
      style={{
        marginTop: BUTTON_MARGIN_TOP * scale,
        height: Math.max(BUTTON_HEIGHT * scale, 44),
        fontSize: Math.max(BUTTON_TEXT_SIZE * scale, 14),
        borderRadius: BUTTON_RADIUS * scale,
      }}
    >
      {isUploading ? '코스 등록 중...' : '코스 등록완료'}
    </button>
  );
}

export default SubmitCourseButton;
