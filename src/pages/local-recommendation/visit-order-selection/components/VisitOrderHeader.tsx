import { useGlobalScale } from '../../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const BACK_BUTTON_VISUAL_SIZE = 24;
const BACK_BUTTON_TOUCH_SIZE = 44;
const BACK_BUTTON_DESIGN_OFFSET = -4;
const HEADER_MARGIN_TOP = 16;
const TITLE_SIZE = 28;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 20;

interface VisitOrderHeaderProps {
  onBack: () => void;
}

function VisitOrderHeader({ onBack }: VisitOrderHeaderProps) {
  const scale = useGlobalScale();
  const backButtonInset =
    (BACK_BUTTON_TOUCH_SIZE - BACK_BUTTON_VISUAL_SIZE * scale) / 2;

  return (
    <>
      <button
        type="button"
        aria-label="이전 화면으로"
        onClick={onBack}
        className="text-gray-5 flex items-center justify-center"
        style={{
          marginTop: -backButtonInset,
          marginLeft: BACK_BUTTON_DESIGN_OFFSET * scale - backButtonInset,
          height: BACK_BUTTON_TOUCH_SIZE,
          width: BACK_BUTTON_TOUCH_SIZE,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="fill-none stroke-current stroke-[2.2]"
          style={{
            height: BACK_BUTTON_VISUAL_SIZE * scale,
            width: BACK_BUTTON_VISUAL_SIZE * scale,
          }}
        >
          <path
            d="m15 4-8 8 8 8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <section
        style={{
          marginTop:
            (BACK_BUTTON_VISUAL_SIZE + HEADER_MARGIN_TOP) * scale -
            BACK_BUTTON_TOUCH_SIZE +
            backButtonInset,
        }}
      >
        <h1
          className="leading-[1.32] font-bold tracking-[-0.04em] text-black"
          style={{ fontSize: TITLE_SIZE * scale }}
        >
          방문 순서를
          <br />
          설정해 주세요
        </h1>
        <p
          className="text-gray-5 tracking-[-0.03em]"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: Math.max(DESCRIPTION_SIZE * scale, 12),
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          드래그하여 순서를 변경할 수 있어요
        </p>
      </section>
    </>
  );
}

export default VisitOrderHeader;
