import { useId, useRef, type ChangeEvent } from 'react';
import { IoClose, IoImageOutline } from 'react-icons/io5';

interface PlacePhotoModalProps {
  placeTitle: string;
  previewUrl: string | null;
  onFileChange: (file: File) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function PlacePhotoModal({
  placeTitle,
  previewUrl,
  onFileChange,
  onClose,
  onConfirm,
}: PlacePhotoModalProps) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-photo-modal-title"
        className="bg-pure-white w-full max-w-[342px] rounded-3xl p-6 shadow-[0_12px_40px_rgba(28,28,28,0.2)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="place-photo-modal-title"
              className="text-lg leading-6 font-semibold text-black"
            >
              장소 사진 등록
            </h2>
            <p className="text-gray-5 mt-2 text-sm leading-5">
              {placeTitle}의 사진을 추가해 주세요
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="사진 등록 닫기"
            className="text-gray-5 -mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-full"
          >
            <IoClose aria-hidden="true" className="text-2xl" />
          </button>
        </div>

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
          className="border-main-5 bg-main-1 mt-6 flex aspect-[294/184] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-4 text-center"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`${placeTitle} 사진 미리보기`}
              className="size-full object-cover"
            />
          ) : (
            <>
              <span className="bg-main-2 text-main-5 flex size-12 items-center justify-center rounded-full">
                <IoImageOutline aria-hidden="true" className="text-2xl" />
              </span>
              <strong className="mt-4 text-sm font-semibold text-black">
                사진을 선택해 주세요
              </strong>
              <span className="text-gray-5 mt-2 text-xs leading-4">
                탭해서 사진을 업로드할 수 있어요
              </span>
            </>
          )}
        </label>

        <button
          type="button"
          disabled={!previewUrl}
          onClick={onConfirm}
          className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 mt-6 h-[53px] w-full rounded-xl text-lg font-semibold disabled:cursor-not-allowed"
        >
          사진 추가하기
        </button>
      </section>
    </div>
  );
}

export default PlacePhotoModal;
