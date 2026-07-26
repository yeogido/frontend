import { useId, useRef, type ChangeEvent } from 'react';
import { IoImageOutline } from 'react-icons/io5';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { scaleValue } from '../../../../utils/responsiveLayout';

const UPLOADER_MARGIN_TOP = 24;
const UPLOADER_PADDING_X = 16;
const UPLOADER_RADIUS = 16;
const UPLOADER_BORDER_WIDTH = 2;
const IMAGE_ICON_CONTAINER_SIZE = 48;
const IMAGE_ICON_SIZE = 24;
const TITLE_MARGIN_TOP = 16;
const TITLE_FONT_SIZE = 14;
const DESCRIPTION_MARGIN_TOP = 8;
const DESCRIPTION_FONT_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 16;

interface PlacePhotoUploaderProps {
  placeTitle: string;
  previewUrl: string | null;
  onFileChange: (file: File) => void;
}

function PlacePhotoUploader({
  placeTitle,
  previewUrl,
  onFileChange,
}: PlacePhotoUploaderProps) {
  const scale = useGlobalScale();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      onFileChange(file);
    }

    event.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
      />

      <label
        htmlFor={inputId}
        className="border-main-5 bg-main-1 flex aspect-[294/184] cursor-pointer flex-col items-center justify-center overflow-hidden border-dashed text-center"
        style={{
          marginTop: UPLOADER_MARGIN_TOP * scale,
          paddingLeft: UPLOADER_PADDING_X * scale,
          paddingRight: UPLOADER_PADDING_X * scale,
          borderRadius: UPLOADER_RADIUS * scale,
          borderWidth: Math.max(1, UPLOADER_BORDER_WIDTH * scale),
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${placeTitle} 사진 미리보기`}
            className="size-full object-cover"
          />
        ) : (
          <>
            <span
              className="bg-main-2 text-main-5 flex items-center justify-center rounded-full"
              style={{
                width: scaleValue(IMAGE_ICON_CONTAINER_SIZE, scale, 44),
                height: scaleValue(IMAGE_ICON_CONTAINER_SIZE, scale, 44),
              }}
            >
              <IoImageOutline
                aria-hidden="true"
                style={{ fontSize: IMAGE_ICON_SIZE * scale }}
              />
            </span>
            <strong
              className="font-semibold text-black"
              style={{
                marginTop: TITLE_MARGIN_TOP * scale,
                fontSize: scaleValue(TITLE_FONT_SIZE, scale, 12),
              }}
            >
              사진을 추가해 주세요.
            </strong>
            <span
              className="text-gray-5"
              style={{
                marginTop: DESCRIPTION_MARGIN_TOP * scale,
                fontSize: scaleValue(DESCRIPTION_FONT_SIZE, scale, 11),
                lineHeight: `${scaleValue(
                  DESCRIPTION_LINE_HEIGHT,
                  scale,
                  15
                )}px`,
              }}
            >
              여기를 탭해서 사진을 업로드할 수 있어요.
            </span>
          </>
        )}
      </label>
    </>
  );
}

export default PlacePhotoUploader;
