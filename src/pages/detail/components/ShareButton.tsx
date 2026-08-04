import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const BUTTON_SIZE = 32;
const ICON_SIZE = 20;

export interface ShareButtonProps {
  onClick: () => void;
  /** 접근성 이름. 미전달 시 코스 상세 기준 문구를 유지한다. */
  label?: string;
}

export function ShareButton({
  onClick,
  label = '코스 공유하기',
}: ShareButtonProps) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex items-center justify-center bg-white text-[#1C1C1C]"
      style={{
        height: BUTTON_SIZE * scale,
        width: BUTTON_SIZE * scale,
        minHeight: 44,
        minWidth: 44,
      }}
    >
      <svg
        aria-hidden="true"
        className="fill-none stroke-current stroke-2"
        viewBox="0 0 24 24"
        style={{ height: ICON_SIZE * scale, width: ICON_SIZE * scale }}
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

export const DetailShareButton = ShareButton;
export default ShareButton;
