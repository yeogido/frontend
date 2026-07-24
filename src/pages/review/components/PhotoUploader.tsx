import type { ChangeEvent, RefObject } from 'react';
import { IoImage } from 'react-icons/io5';

interface PhotoUploaderProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

function PhotoUploader({ inputRef, onChange, disabled }: PhotoUploaderProps) {
  return (
    <section className="mt-[31px]" aria-labelledby="photo-upload-title">
      <h2 id="photo-upload-title" className="text-base leading-6 font-semibold">
        후기 사진 등록
      </h2>
      <label
        className={`mt-[6px] flex h-[213px] flex-col items-center justify-center rounded-xl border border-dashed text-center transition-colors ${
          disabled
            ? 'border-gray-3 bg-gray-1 text-gray-4 cursor-not-allowed'
            : 'border-main-5 bg-main-1 text-gray-5 cursor-pointer'
        }`}
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
          className={`flex size-[51px] items-center justify-center rounded-full ${
            disabled ? 'bg-gray-2' : 'bg-main-3'
          }`}
        >
          <IoImage
            aria-hidden="true"
            className={`text-[27px] ${disabled ? 'text-gray-4' : 'text-main-5'}`}
          />
        </span>
        <strong className="mt-[17px] text-sm leading-5 font-semibold">
          {disabled ? '최대 사진 개수(5장)에 도달했어요' : '사진을 추가해 주세요.'}
        </strong>
        <span className="mt-[7px] text-xs leading-[18px]">
          {disabled
            ? '기존 사진을 지우면 새 사진을 추가할 수 있어요.'
            : '여기를 탭해서 업로드할 수 있어요.'}
        </span>
      </label>
    </section>
  );
}

export default PhotoUploader;
