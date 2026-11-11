import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';

import { compressImage } from '../../../../utils/imageCompression';
import { isSupportedCoverPhoto } from '../../tag-selection/coverPhotoFile';
import { IoClose, IoImageOutline } from 'react-icons/io5';

// Figma 1440 데스크톱 시안(6346:91365) 기준 리터럴 px
const DIALOG_WIDTH = 620;
const DIALOG_PADDING = 36;
const UPLOADER_HEIGHT = 274;

interface PlacePhotoDesktopModalProps {
  placeTitle: string;
  previewUrl: string | null;
  onFileChange: (file: File) => void;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 장소 사진 추가 — 데스크톱 모달. 동작은 모바일 PlacePhotoModal과 같다
 * (사진을 고르기 전에는 확인 비활성, 바깥을 누르면 닫힘). 데스크톱이라
 * 시안의 치수를 그대로 쓰고 Esc로도 닫는다.
 */
function PlacePhotoDesktopModal({
  placeTitle,
  previewUrl,
  onFileChange,
  onClose,
  onConfirm,
}: PlacePhotoDesktopModalProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const [fileError, setFileError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>('button')?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled)'
        )
      );
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      requestRef.current += 1;
      document.removeEventListener('keydown', handleKeyDown);
      previous?.focus();
    };
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const request = ++requestRef.current;
    setFileError('');
    setIsProcessing(true);
    const result = isSupportedCoverPhoto(file)
      ? file
      : await compressImage(file, { forceJpeg: true });
    if (request !== requestRef.current) return;
    setIsProcessing(false);
    if (!isSupportedCoverPhoto(result)) {
      setFileError(
        '사진을 변환하지 못했습니다. JPG, PNG, WebP 파일을 선택해 주세요.'
      );
      return;
    }
    onFileChange(result);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-[24px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-photo-modal-title"
        className="bg-pure-white flex max-h-full w-full flex-col overflow-y-auto rounded-[24px] shadow-[0_12px_40px_rgba(28,28,28,0.2)]"
        style={{ maxWidth: DIALOG_WIDTH, padding: DIALOG_PADDING }}
      >
        <div className="flex items-start justify-between gap-[16px]">
          <div className="min-w-0">
            <h2
              id="place-photo-modal-title"
              className="text-[24px] font-semibold text-black"
            >
              장소에 사진을 추가해 주세요
            </h2>
            <p className="text-gray-5 mt-[8px] text-[16px]">
              장소를 더 매력적으로 소개할 수 있어요!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="사진 등록 닫기"
            className="text-gray-5 -mt-[4px] -mr-[4px] flex size-[40px] shrink-0 items-center justify-center rounded-full"
          >
            <IoClose aria-hidden="true" className="text-[28px]" />
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
          className="border-main-5 bg-main-1 mt-[24px] flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[16px] border-2 border-dashed text-center"
          style={{ height: UPLOADER_HEIGHT }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={placeTitle + ' 사진 미리보기'}
              className="size-full object-cover"
            />
          ) : (
            <>
              <span className="bg-main-2 text-main-5 flex size-[52px] items-center justify-center rounded-full">
                <IoImageOutline aria-hidden="true" className="text-[28px]" />
              </span>
              <strong className="mt-[18px] text-[20px] font-semibold text-black">
                사진을 추가해 주세요.
              </strong>
              <span className="text-gray-5 mt-[10px] text-[16px]">
                여기를 클릭해 사진을 업로드할 수 있어요.
              </span>
            </>
          )}
        </label>

        {fileError ? <p role="alert">{fileError}</p> : null}
        <button
          type="button"
          disabled={!previewUrl || isProcessing || !!fileError}
          onClick={onConfirm}
          className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 mt-[24px] w-full rounded-[12px] py-[16px] text-[20px] font-semibold text-white"
        >
          사진 추가하기
        </button>
      </section>
    </div>
  );
}

export default PlacePhotoDesktopModal;
