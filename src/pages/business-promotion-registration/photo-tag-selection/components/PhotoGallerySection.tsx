import { useId, useRef, useState, type ChangeEvent } from 'react';
import { IoAdd, IoImage, IoTrashOutline } from 'react-icons/io5';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import type { PhotoTagSelectionPhoto } from '../types';

export const MAX_PHOTOS = 5;

// Figma 390 디자인 기준 리터럴 px.
// local-recommendation/tag-selection/components/RepresentativePhotoSection.tsx를
// 참고해 복사·분리한 뒤, 대표 사진 1장 → 최대 5장 다중 등록으로 바꿨다.
// 빈 상태(사진 0장) UI는 Figma 목업과 동일하게 맞췄지만, 여러 장을 채운
// 이후의 그리드 모습은 Figma 목업에 없어 자체적으로 판단해 구현했다.
const SECTION_MARGIN_TOP = 35;
const TITLE_SIZE = 16;
const HELP_MARGIN_TOP = 4;
const HELP_TEXT_SIZE = 12;
const EMPTY_MARGIN_TOP = 12;
const EMPTY_RADIUS = 12;
const EMPTY_ICON_CIRCLE_SIZE = 51;
const EMPTY_ICON_SIZE = 27;
const EMPTY_TITLE_MARGIN_TOP = 20;
const EMPTY_TITLE_SIZE = 14;
const EMPTY_SUBTEXT_MARGIN_TOP = 12;
const EMPTY_SUBTEXT_SIZE = 12;
const GRID_MARGIN_TOP = 12;
const GRID_GAP = 8;
const TILE_RADIUS = 12;
const TILE_ICON_CIRCLE_SIZE = 32;
const TILE_ICON_SIZE = 18;
const REMOVE_BUTTON_SIZE = 22;
const REMOVE_ICON_SIZE = 13;
const ERROR_MARGIN_TOP = 8;
const ERROR_TEXT_SIZE = 12;

interface PhotoGallerySectionProps {
  photos: PhotoTagSelectionPhoto[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}

function PhotoGallerySection({
  photos,
  onAdd,
  onRemove,
}: PhotoGallerySectionProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const scale = useGlobalScale();
  const remainingSlots = MAX_PHOTOS - photos.length;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    if (files.some((file) => !file.type.startsWith('image/'))) {
      setErrorMessage('이미지 파일만 등록할 수 있어요.');
      return;
    }

    setErrorMessage(
      files.length > remainingSlots
        ? `대표 사진은 최대 ${MAX_PHOTOS}장까지 등록할 수 있어요.`
        : ''
    );
    onAdd(files.slice(0, remainingSlots));
  };

  const handleRemove = (id: string) => {
    if (inputRef.current) inputRef.current.value = '';
    setErrorMessage('');
    onRemove(id);
  };

  return (
    <section
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
      aria-labelledby="photo-title"
    >
      <h2
        id="photo-title"
        className="font-semibold"
        style={{ fontSize: TITLE_SIZE * scale }}
      >
        대표 사진 등록(최대 {MAX_PHOTOS}장)
      </h2>
      <p
        className="text-gray-4"
        style={{
          marginTop: HELP_MARGIN_TOP * scale,
          fontSize: HELP_TEXT_SIZE * scale,
        }}
      >
        첫 번째 사진이 대표 사진으로 사용됩니다
      </p>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        disabled={remainingSlots === 0}
        onChange={handleFileChange}
        className="sr-only"
      />

      {photos.length === 0 ? (
        <label
          htmlFor={inputId}
          className="border-main-5 bg-main-1 flex aspect-[342/213] w-full cursor-pointer flex-col items-center justify-center border border-dashed text-center"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            borderRadius: EMPTY_RADIUS * scale,
          }}
        >
          <span
            className="bg-main-3 flex items-center justify-center rounded-full"
            style={{
              width: EMPTY_ICON_CIRCLE_SIZE * scale,
              height: EMPTY_ICON_CIRCLE_SIZE * scale,
            }}
          >
            <IoImage
              aria-hidden="true"
              className="text-main-5"
              style={{ fontSize: EMPTY_ICON_SIZE * scale }}
            />
          </span>
          <strong
            className="font-semibold"
            style={{
              marginTop: EMPTY_TITLE_MARGIN_TOP * scale,
              fontSize: EMPTY_TITLE_SIZE * scale,
            }}
          >
            사진을 추가해 주세요.
          </strong>
          <span
            style={{
              marginTop: EMPTY_SUBTEXT_MARGIN_TOP * scale,
              fontSize: EMPTY_SUBTEXT_SIZE * scale,
            }}
          >
            여기를 탭해서 업로드할 수 있어요.
          </span>
        </label>
      ) : (
        <div
          className="grid grid-cols-3"
          style={{
            marginTop: GRID_MARGIN_TOP * scale,
            gap: GRID_GAP * scale,
          }}
        >
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="bg-gray-2 relative aspect-square overflow-hidden"
              style={{ borderRadius: TILE_RADIUS * scale }}
            >
              <img
                src={photo.previewUrl}
                alt={
                  index === 0
                    ? '대표 사진 미리보기'
                    : `등록한 사진 ${index + 1} 미리보기`
                }
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(photo.id)}
                aria-label={`사진 ${index + 1} 삭제`}
                className="bg-pure-white/90 absolute top-1 right-1 flex items-center justify-center"
                style={{
                  width: REMOVE_BUTTON_SIZE * scale,
                  height: REMOVE_BUTTON_SIZE * scale,
                  borderRadius: 6 * scale,
                }}
              >
                <IoTrashOutline
                  aria-hidden="true"
                  style={{ fontSize: REMOVE_ICON_SIZE * scale }}
                />
              </button>
            </div>
          ))}

          {remainingSlots > 0 ? (
            <label
              htmlFor={inputId}
              className="border-gray-2 flex aspect-square cursor-pointer flex-col items-center justify-center border border-dashed text-center"
              style={{ borderRadius: TILE_RADIUS * scale }}
            >
              <span
                className="bg-gray-1 flex items-center justify-center rounded-full"
                style={{
                  width: TILE_ICON_CIRCLE_SIZE * scale,
                  height: TILE_ICON_CIRCLE_SIZE * scale,
                }}
              >
                <IoAdd
                  aria-hidden="true"
                  className="text-gray-4"
                  style={{ fontSize: TILE_ICON_SIZE * scale }}
                />
              </span>
            </label>
          ) : null}
        </div>
      )}

      {errorMessage ? (
        <p
          className="text-main-5"
          style={{
            marginTop: ERROR_MARGIN_TOP * scale,
            fontSize: ERROR_TEXT_SIZE * scale,
          }}
          aria-live="polite"
        >
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}

export default PhotoGallerySection;
