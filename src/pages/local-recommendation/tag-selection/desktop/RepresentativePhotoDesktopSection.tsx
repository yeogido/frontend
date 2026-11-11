import { useId, useRef, useState } from 'react';
import { IoImage, IoTrashOutline } from 'react-icons/io5';

import {
  COVER_PHOTO_ACCEPT,
  isSupportedCoverPhoto,
  UNSUPPORTED_COVER_PHOTO_MESSAGE,
} from '../coverPhotoFile';

// Figma 1440 데스크톱 시안(6364:56449) 기준 리터럴 px
const BOX_HEIGHT = 272;
const BOX_RADIUS = 24;
const ICON_CIRCLE_SIZE = 51;
const ICON_SIZE = 32;
const TITLE_SIZE = 20;
const SUBTEXT_SIZE = 16;

interface RepresentativePhotoDesktopSectionProps {
  /**
   * file은 새로 고른 실제 File일 때만 있다. 수정 화면에서 기존 사진을
   * "미리보기만" 보여줄 때는 file 없이 previewUrl(원본 URL)만 온다.
   */
  photo: { file: File | null; previewUrl: string } | null;
  onPhotoChange: (file: File | null) => void;
}

function RepresentativePhotoDesktopSection({
  photo,
  onPhotoChange,
}: RepresentativePhotoDesktopSectionProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file && !isSupportedCoverPhoto(file)) {
      setErrorMessage(UNSUPPORTED_COVER_PHOTO_MESSAGE);
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
    <section className="w-full" aria-labelledby="photo-title">
      <h2 id="photo-title" className="sr-only">
        대표 사진 등록
      </h2>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={COVER_PHOTO_ACCEPT}
        onChange={handleFileChange}
        className="sr-only"
      />

      <div
        className="relative w-full overflow-hidden"
        style={{ height: BOX_HEIGHT, borderRadius: BOX_RADIUS }}
      >
        {photo ? (
          <>
            <img
              src={photo.previewUrl}
              alt="등록한 대표 사진 미리보기"
              className="size-full object-cover"
            />
            <div className="absolute right-[16px] bottom-[16px] flex gap-[8px]">
              <label
                htmlFor={inputId}
                className="bg-pure-white/90 inline-flex cursor-pointer items-center justify-center rounded-[8px] px-[16px] py-[10px] text-[16px] font-semibold"
              >
                사진 교체
              </label>
              <button
                type="button"
                onClick={handleDelete}
                aria-label="대표 사진 삭제"
                className="bg-pure-white/90 flex size-[44px] items-center justify-center rounded-[8px]"
              >
                <IoTrashOutline aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className="border-main-5 bg-main-1 flex size-full cursor-pointer flex-col items-center justify-center gap-[18px] border border-dashed text-center"
            style={{ borderRadius: BOX_RADIUS }}
          >
            <span
              className="bg-main-3 flex items-center justify-center rounded-full"
              style={{ width: ICON_CIRCLE_SIZE, height: ICON_CIRCLE_SIZE }}
            >
              <IoImage
                aria-hidden="true"
                className="text-main-5"
                style={{ fontSize: ICON_SIZE }}
              />
            </span>
            <span className="flex flex-col items-center gap-[12px]">
              <strong
                className="font-semibold"
                style={{ fontSize: TITLE_SIZE }}
              >
                사진을 추가해 주세요.
              </strong>
              <span style={{ fontSize: SUBTEXT_SIZE }}>
                여기를 클릭해 업로드 할 수 있어요.
              </span>
            </span>
          </label>
        )}
      </div>

      {errorMessage ? (
        <p className="text-main-5 mt-[8px] text-[16px]" aria-live="polite">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}

export default RepresentativePhotoDesktopSection;
