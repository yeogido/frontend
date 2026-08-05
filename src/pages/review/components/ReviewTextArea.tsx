import type { ChangeEvent } from 'react';

import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 31;
const TITLE_FONT_SIZE = 16;
const TITLE_LINE_HEIGHT = 24;
const TEXTAREA_MARGIN_TOP = 12;
const TEXTAREA_HEIGHT = 109;
const TEXTAREA_RADIUS = 12;
const TEXTAREA_PADDING_X = 14;
const TEXTAREA_PADDING_Y = 16;
const TEXTAREA_FONT_SIZE = 12;
const TEXTAREA_LINE_HEIGHT = 16;

interface ReviewTextAreaProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
}

function ReviewTextArea({
  value,
  onChange,
  maxLength = 300,
}: ReviewTextAreaProps) {
  const scale = useGlobalScale();

  return (
    <section
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
      aria-labelledby="review-title"
    >
      <h2
        id="review-title"
        className="font-semibold"
        style={{
          fontSize: TITLE_FONT_SIZE * scale,
          lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
        }}
      >
        총평을 남겨주세요
      </h2>
      <textarea
        value={value}
        maxLength={maxLength}
        onChange={onChange}
        aria-label="코스 총평"
        placeholder={
          '이 코스는 어땠나요?\n좋았던 점, 아쉬웠던 점을 자유롭게 작성해 주세요.'
        }
        className="border-gray-2 placeholder:text-gray-4 focus:border-main-5 w-full resize-none border bg-white outline-none"
        style={{
          marginTop: TEXTAREA_MARGIN_TOP * scale,
          height: TEXTAREA_HEIGHT * scale,
          borderRadius: TEXTAREA_RADIUS * scale,
          padding: `${TEXTAREA_PADDING_Y * scale}px ${TEXTAREA_PADDING_X * scale}px`,
          fontSize: TEXTAREA_FONT_SIZE * scale,
          lineHeight: `${TEXTAREA_LINE_HEIGHT * scale}px`,
        }}
      />
    </section>
  );
}

export default ReviewTextArea;
