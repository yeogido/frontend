import { useId, useRef, type ChangeEvent } from 'react';
import { IoImageOutline } from 'react-icons/io5';

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
              사진을 추가해 주세요.
            </strong>
            <span className="text-gray-5 mt-2 text-xs leading-4">
              여기를 탭해서 사진을 업로드할 수 있어요.
            </span>
          </>
        )}
      </label>
    </>
  );
}

export default PlacePhotoUploader;
