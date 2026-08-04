import type { ChangeEvent, RefObject } from 'react';
import { IoImage } from 'react-icons/io5';

import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 31;
const TITLE_FONT_SIZE = 16;
const TITLE_LINE_HEIGHT = 24;
const UPLOADER_MARGIN_TOP = 6;
const UPLOADER_HEIGHT = 213;
const UPLOADER_RADIUS = 12;
const UPLOADER_BORDER_WIDTH = 1;
const ICON_CIRCLE_SIZE = 51;
const ICON_SIZE = 27;
const STRONG_MARGIN_TOP = 17;
const STRONG_FONT_SIZE = 14;
const STRONG_LINE_HEIGHT = 20;
const DESCRIPTION_MARGIN_TOP = 7;
const DESCRIPTION_FONT_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 18;

interface PhotoUploaderProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

function PhotoUploader({ inputRef, onChange, disabled }: PhotoUploaderProps) {
  const scale = useGlobalScale();

  return (
    <section
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
      aria-labelledby="photo-upload-title"
    >
      <h2
        id="photo-upload-title"
        className="font-semibold"
        style={{
          fontSize: TITLE_FONT_SIZE * scale,
          lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
        }}
      >
        후기 사진 등록
      </h2>
      <label
        className={`flex flex-col items-center justify-center border border-dashed text-center transition-colors ${
          disabled
            ? 'border-gray-3 bg-gray-1 text-gray-4 cursor-not-allowed'
            : 'border-main-5 bg-main-1 text-gray-5 cursor-pointer'
        }`}
        style={{
          marginTop: UPLOADER_MARGIN_TOP * scale,
          height: UPLOADER_HEIGHT * scale,
          borderRadius: UPLOADER_RADIUS * scale,
          borderWidth: Math.max(1, UPLOADER_BORDER_WIDTH * scale),
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <span
          className={`flex items-center justify-center rounded-full ${
            disabled ? 'bg-gray-2' : 'bg-main-3'
          }`}
          style={{
            width: ICON_CIRCLE_SIZE * scale,
            height: ICON_CIRCLE_SIZE * scale,
          }}
        >
          <IoImage
            aria-hidden="true"
            className={disabled ? 'text-gray-4' : 'text-main-5'}
            style={{ fontSize: ICON_SIZE * scale }}
          />
        </span>
        <strong
          className="font-semibold"
          style={{
            marginTop: STRONG_MARGIN_TOP * scale,
            fontSize: STRONG_FONT_SIZE * scale,
            lineHeight: `${STRONG_LINE_HEIGHT * scale}px`,
          }}
        >
          {disabled
            ? '최대 사진 개수(5장)에 도달했어요'
            : '사진을 추가해 주세요.'}
        </strong>
        <span
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_FONT_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          {disabled
            ? '기존 사진을 지우면 새 사진을 추가할 수 있어요.'
            : '여기를 탭해서 업로드할 수 있어요.'}
        </span>
      </label>
    </section>
  );
}

export default PhotoUploader;
