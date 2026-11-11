import { useGlobalScale } from '../../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px (코스 수정 5998:29002)
const TOOLBAR_MARGIN_TOP = 24;
const DURATION_TEXT_SIZE = 20;
const TOGGLE_PADDING_X = 10;
const TOGGLE_PADDING_Y = 6;
const TOGGLE_TEXT_SIZE = 14;

interface VisitOrderEditToolbarProps {
  /** '1박2일'처럼 보여줄 기간 라벨. */
  durationLabel: string;
  /** 편집 모드 여부 — 켜져 있으면 버튼이 '완료'가 된다. */
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

/** 수정 흐름에서만 보이는 줄 — 기간 표시와 편집 모드 토글. */
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
      <p
        className="text-main-5 font-semibold"
        style={{ fontSize: Math.max(DURATION_TEXT_SIZE * scale, 16) }}
      >
        {durationLabel} 코스
      </p>
      <button
        type="button"
        onClick={onToggleEditMode}
        className="border-gray-3 text-gray-4 rounded-full border font-medium"
        style={{
          paddingLeft: TOGGLE_PADDING_X * scale,
          paddingRight: TOGGLE_PADDING_X * scale,
          paddingTop: TOGGLE_PADDING_Y * scale,
          paddingBottom: TOGGLE_PADDING_Y * scale,
          fontSize: Math.max(TOGGLE_TEXT_SIZE * scale, 12),
        }}
      >
        {isEditMode ? '완료' : '수정하기'}
      </button>
    </div>
  );
}

export default VisitOrderEditToolbar;
