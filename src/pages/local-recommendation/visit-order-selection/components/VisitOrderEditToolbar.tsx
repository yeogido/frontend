import { useGlobalScale } from '../../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const TOOLBAR_MARGIN_TOP = 20;
const CHIP_HEIGHT = 30;
const CHIP_PADDING_X = 12;
const CHIP_RADIUS = 15;
const CHIP_TEXT_SIZE = 13;
const TOGGLE_TEXT_SIZE = 14;
const TOGGLE_TOUCH_HEIGHT = 44;

interface VisitOrderEditToolbarProps {
  /** '1박 2일 코스'처럼 보여줄 기간 라벨. */
  durationLabel: string;
  /** 편집 모드 여부 — 켜져 있으면 버튼이 '완료'가 된다. */
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

/** 수정 흐름에서만 보이는 줄 — 기간 칩과 편집 모드 토글. */
function VisitOrderEditToolbar({
  durationLabel,
  isEditMode,
  onToggleEditMode,
}: VisitOrderEditToolbarProps) {
  const scale = useGlobalScale();

  return (
    <div
      className="flex items-center justify-between"
      style={{ marginTop: TOOLBAR_MARGIN_TOP * scale }}
    >
      <span
        className="bg-background text-gray-5 inline-flex items-center font-medium"
        style={{
          height: CHIP_HEIGHT * scale,
          paddingLeft: CHIP_PADDING_X * scale,
          paddingRight: CHIP_PADDING_X * scale,
          borderRadius: CHIP_RADIUS * scale,
          fontSize: Math.max(CHIP_TEXT_SIZE * scale, 12),
        }}
      >
        {durationLabel} 코스
      </span>
      <button
        type="button"
        onClick={onToggleEditMode}
        className="text-main-5 font-semibold"
        style={{
          height: TOGGLE_TOUCH_HEIGHT,
          fontSize: Math.max(TOGGLE_TEXT_SIZE * scale, 13),
        }}
      >
        {isEditMode ? '완료' : '수정하기'}
      </button>
    </div>
  );
}

export default VisitOrderEditToolbar;
