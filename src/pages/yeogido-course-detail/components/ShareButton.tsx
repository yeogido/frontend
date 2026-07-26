interface ShareButtonProps {
  onClick: () => void;
}

function ShareButton({ onClick }: ShareButtonProps) {
  return (
    <button
      type="button"
      aria-label="코스 공유하기"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center bg-white text-[#1C1C1C]"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5 fill-none stroke-current stroke-2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    </button>
  );
}

export default ShareButton;
