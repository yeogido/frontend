import { useId, useState, type ChangeEvent } from 'react';
import { IoTrashOutline } from 'react-icons/io5';
import { MdAdd, MdPhotoCameraBack } from 'react-icons/md';

import KeywordSelectionDesktopSection from '../../../local-recommendation/tag-selection/desktop/KeywordSelectionDesktopSection';
import DesktopStepLayout from '../../components/DesktopStepLayout';
import {
  promotionCategoryOptions,
  type PhotoTagSelectionPhoto,
  type PromotionCategoryLabel,
  type TagId,
} from '../types';
import { MAX_PHOTOS, pickPhotoFiles } from '../utils';

// Figma 1440 데스크톱 시안(7193:45484 / 7193:46190) 기준 리터럴 px
const SLOTS = Array.from({ length: MAX_PHOTOS }, (_, index) => index);

interface PhotoTagDesktopViewProps {
  readonly photos: readonly PhotoTagSelectionPhoto[];
  readonly onAddPhotos: (files: File[]) => void;
  readonly onRemovePhoto: (id: string) => void;
  readonly selectedTagIds: ReadonlySet<TagId>;
  readonly limitMessage: string;
  readonly onTagToggle: (tagId: TagId) => void;
  readonly category: PromotionCategoryLabel | null;
  readonly onCategoryChange: (category: PromotionCategoryLabel) => void;
  readonly submitLabel: string;
  readonly isSubmitDisabled: boolean;
  readonly submitError: string;
  readonly onSubmit: () => void;
  readonly onBack: () => void;
}

/**
 * 사진·키워드·카테고리 — 데스크톱 뷰.
 *
 * 시안의 제목은 "어떤 코스인가요?"(코스 등록 화면 문구)로 적혀 있어, 화면이
 * 실제로 하는 일에 맞는 모바일 문구를 쓴다.
 */
function PhotoTagDesktopView({
  photos,
  onAddPhotos,
  onRemovePhoto,
  selectedTagIds,
  limitMessage,
  onTagToggle,
  category,
  onCategoryChange,
  submitLabel,
  isSubmitDisabled,
  submitError,
  onSubmit,
  onBack,
}: PhotoTagDesktopViewProps) {
  const inputId = useId();
  const [photoError, setPhotoError] = useState('');
  const remainingSlots = MAX_PHOTOS - photos.length;
  const [coverPhoto] = photos;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const { accepted, errorMessage } = pickPhotoFiles(files, remainingSlots);
    setPhotoError(errorMessage);
    if (accepted.length > 0) onAddPhotos(accepted);
  };

  return (
    <DesktopStepLayout
      title="사진과 키워드를 추가해 주세요"
      description="장소를 더 매력적으로 소개할 수 있어요!"
      onBack={onBack}
    >
      <div className="mt-[24px] flex flex-col gap-[24px]">
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          disabled={remainingSlots === 0}
          onChange={handleFileChange}
          className="peer sr-only"
        />

        {coverPhoto ? (
          <img
            src={coverPhoto.previewUrl}
            alt="대표 사진 미리보기"
            className="aspect-[742/563] w-full rounded-[24px] object-cover"
          />
        ) : (
          <label
            htmlFor={inputId}
            className="border-main-5 bg-main-1 peer-focus-visible:outline-main-5 flex aspect-[742/563] w-full cursor-pointer flex-col items-center justify-center gap-[18px] rounded-[24px] border border-dashed text-center peer-focus-visible:outline-2"
          >
            <span className="bg-main-3 flex size-[51px] items-center justify-center rounded-full">
              <MdPhotoCameraBack
                aria-hidden="true"
                className="text-main-5 text-[32px]"
              />
            </span>
            <span className="flex flex-col items-center gap-[12px]">
              <strong className="text-[20px] font-semibold text-black">
                사진을 추가해 주세요.
              </strong>
              <span className="text-[16px] text-black">
                여기를 클릭해 업로드할 수 있어요.
              </span>
            </span>
          </label>
        )}

        {/* 숨긴 파일 입력에 키보드 포커스가 오면 빈 칸에 테두리를 보여준다. */}
        <section
          aria-labelledby="selected-photos-title"
          className="peer-focus-visible:[&_label]:outline-main-5 flex flex-col gap-[20px] peer-focus-visible:[&_label]:outline-2"
        >
          <div className="flex items-center justify-between">
            <h2
              id="selected-photos-title"
              className="text-[20px] leading-[30px] font-semibold text-black"
            >
              선택된 사진{' '}
              <span className="text-gray-4 font-normal">
                ({photos.length}/{MAX_PHOTOS})
              </span>
            </h2>
            <p className="text-gray-4 text-[16px]">
              최대 {MAX_PHOTOS}장까지 선택할 수 있어요.
            </p>
          </div>

          <ul className="grid grid-cols-5 gap-[24px]">
            {SLOTS.map((index) => {
              const photo = photos[index];

              return (
                <li
                  key={photo?.id ?? `empty-${index}`}
                  className="bg-gray-2 relative aspect-square overflow-hidden rounded-[12px]"
                >
                  {photo ? (
                    <>
                      <img
                        src={photo.previewUrl}
                        alt={`등록한 사진 ${index + 1} 미리보기`}
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoError('');
                          onRemovePhoto(photo.id);
                        }}
                        aria-label={`사진 ${index + 1} 삭제`}
                        className="bg-pure-white/90 absolute top-[8px] right-[8px] flex size-[28px] items-center justify-center rounded-[6px]"
                      >
                        <IoTrashOutline aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <label
                      htmlFor={inputId}
                      className="text-gray-3 flex size-full cursor-pointer items-center justify-center"
                    >
                      <MdAdd aria-hidden="true" className="text-[36px]" />
                      <span className="sr-only">사진 추가</span>
                    </label>
                  )}
                </li>
              );
            })}
          </ul>

          {photoError ? (
            <p className="text-main-5 text-[16px]" aria-live="polite">
              {photoError}
            </p>
          ) : null}
        </section>

        <KeywordSelectionDesktopSection
          selectedTagIds={selectedTagIds}
          limitMessage={limitMessage}
          onToggle={onTagToggle}
        />

        <section
          aria-labelledby="category-title"
          className="flex flex-col gap-[12px]"
        >
          <h2
            id="category-title"
            className="text-[20px] leading-[24px] font-semibold text-black"
          >
            카테고리 등록
          </h2>
          <div className="flex flex-wrap gap-[16px]">
            {promotionCategoryOptions.map((option) => {
              const selected = category === option;

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onCategoryChange(option)}
                  className={`h-[35px] rounded-full border px-[12px] text-[18px] ${
                    selected
                      ? 'border-main-5 bg-main-2 text-main-5'
                      : 'border-gray-3 bg-background text-gray-3'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <button
        type="button"
        disabled={isSubmitDisabled}
        onClick={onSubmit}
        className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 mt-[60px] h-[61px] w-full rounded-[12px] text-[24px] font-semibold text-white disabled:cursor-not-allowed"
      >
        {submitLabel}
      </button>

      {submitError ? (
        <p className="text-main-5 mt-[8px] text-[16px]" role="alert">
          {submitError}
        </p>
      ) : null}
    </DesktopStepLayout>
  );
}

export default PhotoTagDesktopView;
