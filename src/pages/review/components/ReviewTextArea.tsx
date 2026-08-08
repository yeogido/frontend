import type { ChangeEvent } from 'react';

import { useGlobalScale } from '../../../hooks/useGlobalScale';
import {
  REVIEW_CONTENT_MAX_LENGTH,
  REVIEW_CONTENT_PLACEHOLDER,
} from '../reviewForm';

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
const HINT_FONT_SIZE = 11;
const COUNTER_LINE_HEIGHT = 14;
/** 상자 아래 여백. 위(16)보다 좁게 잡아 카운터가 테두리에 붙어 보이지 않게 한다. */
const BOX_PADDING_BOTTOM = 10;

interface ReviewTextAreaProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
}

function ReviewTextArea({
  value,
  onChange,
  maxLength = REVIEW_CONTENT_MAX_LENGTH,
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
      {/*
        테두리는 바깥 상자가 그리고 textarea는 그 안을 채운다. 카운터를
        textarea 위에 겹쳐 놓으면 글이 스크롤될 때 그 아래로 지나가 겹쳐
        보인다. 줄을 따로 두어 글이 카운터 윗줄까지만 차게 한다.
      */}
      <div
        className="border-gray-2 focus-within:border-main-5 flex flex-col border bg-white"
        style={{
          marginTop: TEXTAREA_MARGIN_TOP * scale,
          height: TEXTAREA_HEIGHT * scale,
          borderRadius: TEXTAREA_RADIUS * scale,
          paddingTop: TEXTAREA_PADDING_Y * scale,
          paddingBottom: BOX_PADDING_BOTTOM * scale,
          paddingLeft: TEXTAREA_PADDING_X * scale,
          paddingRight: TEXTAREA_PADDING_X * scale,
        }}
      >
        <textarea
          value={value}
          maxLength={maxLength}
          onChange={onChange}
          aria-label="코스 총평"
          placeholder={REVIEW_CONTENT_PLACEHOLDER}
          className="placeholder:text-gray-4 scrollbar-hide min-h-0 w-full flex-1 resize-none bg-transparent outline-none"
          style={{
            fontSize: TEXTAREA_FONT_SIZE * scale,
            lineHeight: `${TEXTAREA_LINE_HEIGHT * scale}px`,
          }}
        />
        {/* 입력이 조용히 막히지 않도록 현재 글자 수를 보여준다. */}
        <span
          className="text-gray-4 shrink-0 text-right"
          style={{
            fontSize: HINT_FONT_SIZE * scale,
            lineHeight: `${COUNTER_LINE_HEIGHT * scale}px`,
          }}
          aria-live="polite"
        >
          {value.length}/{maxLength}
        </span>
      </div>
    </section>
  );
}

export default ReviewTextArea;
