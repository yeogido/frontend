// Figma 1440 데스크톱 시안(6303:49977 filter_chip_desktop) 기준 리터럴 px.
const CHIP_HEIGHT = 37;

interface DesktopFilterChipProps {
  readonly label: string;
  readonly selected: boolean;
  readonly onClick: () => void;
}

/** 알약 모양 필터 칩. 선택되면 메인 색 테두리와 연한 배경으로 바뀐다. */
function DesktopFilterChip({
  label,
  selected,
  onClick,
}: DesktopFilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{ height: CHIP_HEIGHT }}
      className={`rounded-full border px-[12px] text-[18px] whitespace-nowrap ${
        selected
          ? 'border-main-5 bg-main-2 text-main-5'
          : 'border-gray-2 text-gray-4 bg-white'
      }`}
    >
      {label}
    </button>
  );
}

export default DesktopFilterChip;
