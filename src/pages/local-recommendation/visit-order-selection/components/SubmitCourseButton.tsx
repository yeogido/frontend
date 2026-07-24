interface SubmitCourseButtonProps {
  onSubmit: () => void;
}

function SubmitCourseButton({ onSubmit }: SubmitCourseButtonProps) {
  return (
    <button
      type="button"
      onClick={onSubmit}
      className="bg-main-5 mt-[50px] h-[54px] w-full shrink-0 rounded-xl text-base font-semibold text-white"
    >
      코스 등록하기
    </button>
  );
}

export default SubmitCourseButton;
