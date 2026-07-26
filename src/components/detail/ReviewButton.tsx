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
  return (
    <div className={`flex w-full ${className}`}>
      <button
        type="button"
        className="bg-main-5 h-[52px] w-full rounded-[14px] text-[18px] font-bold text-white active:scale-[0.99]"
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
}

export default ReviewButton;
