import { useGlobalScale } from '../../../../hooks/useGlobalScale';

const BUTTON_MARGIN_TOP = 50;
const BUTTON_HEIGHT = 54;
const BUTTON_TEXT_SIZE = 16;
const BUTTON_RADIUS = 12;

interface SubmitCourseButtonProps {
  onSubmit: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  /** 관리자 코스 수정 흐름에서 등록 대신 수정 문구를 쓰기 위한 옵션. */
  isEditing?: boolean;
}

function SubmitCourseButton({
  onSubmit,
  disabled = false,
  isSubmitting = false,
  isEditing = false,
}: SubmitCourseButtonProps) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={disabled}
      className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 w-full shrink-0 font-semibold text-white"
      style={{
        marginTop: BUTTON_MARGIN_TOP * scale,
        height: Math.max(BUTTON_HEIGHT * scale, 44),
        fontSize: BUTTON_TEXT_SIZE * scale,
        borderRadius: BUTTON_RADIUS * scale,
      }}
    >
      {isSubmitting
        ? isEditing
          ? '수정 중...'
          : '등록 중...'
        : isEditing
          ? '코스 수정하기'
          : '코스 등록하기'}
    </button>
  );
}

export default SubmitCourseButton;
