import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const HEADER_MARGIN_TOP = 17;
const TITLE_SIZE = 30;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_SIZE = 13;
const DESCRIPTION_LINE_HEIGHT = 19;

function ReviewHeader() {
  const scale = useGlobalScale();

  return (
    <header style={{ marginTop: HEADER_MARGIN_TOP * scale }}>
      <h1
        className="font-bold leading-[1.25] tracking-[-0.03em]"
        style={{ fontSize: TITLE_SIZE * scale }}
      >
        이번 여행은
        <br />
        어떠셨나요?
      </h1>
      <p
        className="text-gray-5"
        style={{
          marginTop: DESCRIPTION_MARGIN_TOP * scale,
          fontSize: DESCRIPTION_SIZE * scale,
          lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
        }}
      >
        다른 여행자에게 도움이 되는 후기를 남겨보세요
      </p>
    </header>
  );
}

export default ReviewHeader;
