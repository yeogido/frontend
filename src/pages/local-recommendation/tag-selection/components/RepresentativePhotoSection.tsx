import { useId, useRef, useState } from 'react';
import { IoImage, IoTrashOutline } from 'react-icons/io5';

import type { PhotoSelection } from '../types';

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
    <section className="mt-[35px]" aria-labelledby="photo-title">
      <h2 id="photo-title" className="text-base font-semibold">
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

      <div className="relative mt-3 aspect-[342/213] overflow-hidden rounded-xl">
        {photo ? (
          <>
            <img
              src={photo.previewUrl}
              alt="등록한 대표 사진 미리보기"
              className="size-full object-cover"
            />
            <div className="absolute right-3 bottom-3 flex gap-2">
              <label
                htmlFor={inputId}
                className="bg-pure-white/90 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold"
              >
                사진 교체
              </label>
              <button
                type="button"
                onClick={handleDelete}
                aria-label="대표 사진 삭제"
                className="bg-pure-white/90 flex size-8 items-center justify-center rounded-lg"
              >
                <IoTrashOutline aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className="border-main-5 bg-main-1 flex size-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed text-center"
          >
            <span className="bg-main-3 flex size-[51px] items-center justify-center rounded-full">
              <IoImage aria-hidden="true" className="text-main-5 text-[27px]" />
            </span>
            <strong className="mt-5 text-sm font-semibold">
              사진을 추가해 주세요.
            </strong>
            <span className="mt-3 text-xs">
              여기를 탭해서 업로드 할 수 있어요.
            </span>
          </label>
        )}
      </div>

      {errorMessage ? (
        <p className="text-main-5 mt-2 text-xs" aria-live="polite">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}

export default RepresentativePhotoSection;
