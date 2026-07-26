import { useId, useRef, useState } from 'react';
import { IoImage, IoTrashOutline } from 'react-icons/io5';

import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { scaleValue } from '../../../../utils/responsiveLayout';
import type { PhotoSelection } from '../types';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 35;
const TITLE_SIZE = 16;
const PHOTO_MARGIN_TOP = 12;
const PHOTO_RADIUS = 12;
const ACTION_RIGHT = 12;
const ACTION_BOTTOM = 12;
const ACTION_GAP = 8;
const ACTION_RADIUS = 8;
const REPLACE_PADDING_X = 12;
const REPLACE_PADDING_Y = 8;
const REPLACE_TEXT_SIZE = 12;
const ICON_CIRCLE_SIZE = 51;
const ICON_SIZE = 27;
const TITLE_TEXT_MARGIN_TOP = 20;
const TITLE_TEXT_SIZE = 14;
const SUBTEXT_MARGIN_TOP = 12;
const SUBTEXT_SIZE = 12;
const ERROR_MARGIN_TOP = 8;
const ERROR_TEXT_SIZE = 12;

interface RepresentativePhotoSectionProps {
  photo: PhotoSelection | null;
  onPhotoChange: (file: File | null) => void;
}

function RepresentativePhotoSection({
  photo,
  onPhotoChange,
}: RepresentativePhotoSectionProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const scale = useGlobalScale();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file && !file.type.startsWith('image/')) {
      setErrorMessage('이미지 파일만 등록할 수 있어요.');
      event.target.value = '';
      return;
    }

    setErrorMessage('');
    onPhotoChange(file);
    event.target.value = '';
  };

  const handleDelete = () => {
    if (inputRef.current) inputRef.current.value = '';
    setErrorMessage('');
    onPhotoChange(null);
  };

  return (
    <section
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
      aria-labelledby="photo-title"
    >
      <h2
        id="photo-title"
        className="font-semibold"
        style={{ fontSize: scaleValue(TITLE_SIZE, scale, 14) }}
      >
        대표 사진 등록
      </h2>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
      />

      <div
        className="relative aspect-[342/213] overflow-hidden"
        style={{
          marginTop: PHOTO_MARGIN_TOP * scale,
          borderRadius: PHOTO_RADIUS * scale,
        }}
      >
        {photo ? (
          <>
            <img
              src={photo.previewUrl}
              alt="등록한 대표 사진 미리보기"
              className="size-full object-cover"
            />
            <div
              className="absolute flex"
              style={{
                right: ACTION_RIGHT * scale,
                bottom: ACTION_BOTTOM * scale,
                gap: ACTION_GAP * scale,
              }}
            >
              <label
                htmlFor={inputId}
                className="bg-pure-white/90 inline-flex cursor-pointer items-center justify-center font-semibold"
                style={{
                  paddingLeft: REPLACE_PADDING_X * scale,
                  paddingRight: REPLACE_PADDING_X * scale,
                  paddingTop: REPLACE_PADDING_Y * scale,
                  paddingBottom: REPLACE_PADDING_Y * scale,
                  minHeight: MIN_TOUCH_TARGET,
                  minWidth: MIN_TOUCH_TARGET,
                  fontSize: scaleValue(REPLACE_TEXT_SIZE, scale, 10),
                  borderRadius: ACTION_RADIUS * scale,
                }}
              >
                사진 교체
              </label>
              <button
                type="button"
                onClick={handleDelete}
                aria-label="대표 사진 삭제"
                className="bg-pure-white/90 flex items-center justify-center"
                style={{
                  width: MIN_TOUCH_TARGET,
                  height: MIN_TOUCH_TARGET,
                  borderRadius: ACTION_RADIUS * scale,
                }}
              >
                <IoTrashOutline aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className="border-main-5 bg-main-1 flex size-full cursor-pointer flex-col items-center justify-center border border-dashed text-center"
            style={{ borderRadius: PHOTO_RADIUS * scale }}
          >
            <span
              className="bg-main-3 flex items-center justify-center rounded-full"
              style={{
                width: ICON_CIRCLE_SIZE * scale,
                height: ICON_CIRCLE_SIZE * scale,
              }}
            >
              <IoImage
                aria-hidden="true"
                className="text-main-5"
                style={{ fontSize: ICON_SIZE * scale }}
              />
            </span>
            <strong
              className="font-semibold"
              style={{
                marginTop: TITLE_TEXT_MARGIN_TOP * scale,
                fontSize: scaleValue(TITLE_TEXT_SIZE, scale, 12),
              }}
            >
              사진을 추가해 주세요.
            </strong>
            <span
              style={{
                marginTop: SUBTEXT_MARGIN_TOP * scale,
                fontSize: scaleValue(SUBTEXT_SIZE, scale, 10),
              }}
            >
              여기를 탭해서 업로드 할 수 있어요.
            </span>
          </label>
        )}
      </div>

      {errorMessage ? (
        <p
          className="text-main-5"
          style={{
            marginTop: ERROR_MARGIN_TOP * scale,
            fontSize: scaleValue(ERROR_TEXT_SIZE, scale, 11),
          }}
          aria-live="polite"
        >
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}

export default RepresentativePhotoSection;
