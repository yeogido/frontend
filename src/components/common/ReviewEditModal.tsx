import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import addPhoto from '../../pages/travel-record/photo-selection/assets/photo-add-icon.svg';
import closeRounded from '../../assets/icons/close-rounded.svg';
import darkStar from '../../assets/icons/dark star.svg';
import star from '../../assets/icons/star.svg';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import type {
  EditableReview,
  ReviewEditSubmission,
} from '../../hooks/useReviews';
import {
  DEFAULT_REVIEW_RATING,
  isReviewFormValid,
  MAX_REVIEW_PHOTOS,
  REVIEW_CONTENT_MAX_LENGTH,
  REVIEW_CONTENT_PLACEHOLDER,
} from '../../utils/reviewForm';

/**
 * 화면에 놓인 사진 한 장.
 *
 * 기존 사진은 imageKey를 그대로 되돌려 보내야 서버가 유지하고, 새로 고른
 * 사진은 저장할 때 업로드해서 key를 받는다. 그래서 둘을 구분해 들고 있는다.
 */
type EditablePhoto =
  | { id: string; kind: 'existing'; imageKey: string; src: string }
  | { id: string; kind: 'new'; file: File; src: string };

export interface ReviewEditModalProps {
  /** 수정할 후기. 없으면 닫힌 상태다. */
  review: EditableReview | undefined;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (submission: ReviewEditSubmission) => void;
}

function ReviewEditModal({
  review,
  isPending = false,
  onClose,
  onSubmit,
}: ReviewEditModalProps) {
  const scale = Math.min(useGlobalScale(), 1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 호출부가 후기 id를 key로 주므로, 다른 후기를 열면 이 컴포넌트가 새로
  // 마운트되면서 아래 초기값이 다시 계산된다.
  const [photos, setPhotos] = useState<EditablePhoto[]>(() =>
    (review?.editableImages ?? [])
      .slice(0, MAX_REVIEW_PHOTOS)
      .map(({ imageKey, imageUrl }) => ({
        id: `existing-${imageKey}`,
        kind: 'existing' as const,
        imageKey,
        src: imageUrl,
      }))
  );
  const [rating, setRating] = useState(() =>
    Math.min(Math.max(Math.round(review?.rating ?? DEFAULT_REVIEW_RATING), 1), 5)
  );
  const [content, setContent] = useState(() => review?.content ?? '');
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // 새로 고른 사진의 미리보기 URL은 화면을 벗어날 때 해제한다.
  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => {
        if (photo.kind === 'new') URL.revokeObjectURL(photo.src);
      });
    },
    []
  );

  if (!review || typeof document === 'undefined') return null;

  const removePhoto = (id: string) => {
    setPhotos((current) => {
      const removed = current.find((photo) => photo.id === id);
      if (removed?.kind === 'new') URL.revokeObjectURL(removed.src);
      return current.filter((photo) => photo.id !== id);
    });
  };

  // FileList는 input에 묶인 live 객체라 input.value를 비우면 함께 비워진다.
  // 상태 갱신 함수 안에서 읽으면 그때는 이미 비어 있어 아무 사진도 안 붙는다.
  // 여기서 즉시 배열로 떠 두고, 미리보기 URL도 업데이터 밖에서 만든다.
  const handleFiles = (files: FileList | null) => {
    // 음수면 slice가 뒤에서 잘라내 오히려 상한을 넘겨 담는다.
    const remaining = Math.max(MAX_REVIEW_PHOTOS - photos.length, 0);
    const additions = Array.from(files ?? [])
      .slice(0, remaining)
      .map((file) => {
        const src = URL.createObjectURL(file);
        return { id: src, kind: 'new' as const, file, src };
      });

    if (additions.length === 0) return;

    setPhotos((current) => [...current, ...additions]);
  };

  // 사진 목록을 못 구한 후기는 사진을 건드리지 않는 수정만 허용한다.
  const canEditPhotos = review.canEditPhotos ?? true;
  const canSubmit =
    !isPending &&
    isReviewFormValid({ rating, review: content, photoCount: photos.length });

  // 사진을 손대지 않았으면 목록을 보내지 않는다. 명세대로 서버가 기존
  // 이미지를 그대로 두므로 헛된 삭제/삽입이 없다.
  const initialImageKeys = review.editableImages
    .slice(0, MAX_REVIEW_PHOTOS)
    .map(({ imageKey }) => imageKey);
  const isPhotosUnchanged =
    photos.length === initialImageKeys.length &&
    photos.every(
      (photo, index) =>
        photo.kind === 'existing' && photo.imageKey === initialImageKeys[index]
    );

  const handleSubmit = () => {
    if (!canSubmit) return;

    onSubmit({
      rating,
      content: content.trim(),
      photos: !canEditPhotos || isPhotosUnchanged
        ? undefined
        : photos.map((photo) =>
            photo.kind === 'existing'
              ? { imageKey: photo.imageKey }
              : { file: photo.file }
          ),
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="후기 수정"
        className="relative max-h-[calc(100dvh-48px)] w-full max-w-[342px] overflow-y-auto rounded-xl bg-[#f9f9f9] px-6 pt-11 pb-5 shadow-[0_1px_5px_rgba(0,0,0,0.07)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ transform: `scale(${scale})` }}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-5 right-5 flex size-6 items-center justify-center"
        >
          <img src={closeRounded} alt="" aria-hidden="true" className="size-6" />
        </button>
        <h2 className="pr-8 text-[18px] leading-[21px] font-semibold text-[#1c1c1c]">
          후기를 수정해요
        </h2>
        <p className="mt-1 text-[14px] leading-[17px] text-[#7f7f7f]">
          {canEditPhotos
            ? '사진과 후기를 수정할 수 있어요'
            : '별점과 후기를 수정할 수 있어요. 사진은 그대로 유지돼요.'}
        </p>

        {canEditPhotos && (
        <section className="mt-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#1c1c1c]">
              선택된 사진{' '}
              <span className="font-normal text-[#7f7f7f]">
                ({photos.length}/{MAX_REVIEW_PHOTOS})
              </span>
            </h3>
            <span className="text-[11px] text-[#a1a1a1]">
              최대 {MAX_REVIEW_PHOTOS}장까지 선택할 수 있어요.
            </span>
          </div>
          <div className="scrollbar-hide mt-1 flex gap-3 overflow-x-auto pt-2 pr-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative size-[129px] shrink-0">
                <div className="flex size-full items-center justify-center overflow-hidden rounded-xl bg-[#e4e4e4]">
                  <img src={photo.src} alt="" className="size-full object-cover" />
                </div>
                <button
                  type="button"
                  aria-label="사진 삭제"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full bg-[#7f7f7f] shadow-[0_2px_8px_rgba(0,0,0,0.16)]"
                >
                  <img
                    src={closeRounded}
                    alt=""
                    aria-hidden="true"
                    className="size-3 brightness-0 invert"
                  />
                </button>
              </div>
            ))}
            {photos.length < MAX_REVIEW_PHOTOS ? (
              <button
                type="button"
                aria-label="사진 추가"
                onClick={() => fileInputRef.current?.click()}
                className="flex size-[129px] shrink-0 items-center justify-center rounded-[10px] bg-[#e4e4e4]"
              >
                <img src={addPhoto} alt="" aria-hidden="true" className="size-8" />
              </button>
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </section>
        )}

        <section className="mt-4">
          <h3 className="text-[14px] leading-5 font-semibold text-[#1c1c1c]">
            별점을 남겨주세요
          </h3>
          <div
            className="mt-2 flex items-center gap-1"
            role="group"
            aria-label="별점 선택"
          >
            {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value}점`}
                aria-pressed={rating === value}
                onClick={() => setRating(value)}
                className="flex size-9 items-center justify-center"
              >
                <img
                  src={value <= rating ? star : darkStar}
                  alt=""
                  aria-hidden="true"
                  className={value <= rating ? 'size-8' : 'size-8 scale-[1.42]'}
                />
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4">
          <h3 className="text-[14px] leading-5 font-semibold text-[#1c1c1c]">
            총평을 남겨주세요
          </h3>
          {/*
            테두리는 바깥 상자가 그린다. 카운터를 textarea 위에 겹쳐 놓으면
            글이 스크롤될 때 그 아래로 지나가 겹쳐 보이므로 줄을 따로 둔다.
            label로 두면 여백이나 카운터 줄을 눌러도 입력으로 포커스가 간다.
          */}
          <label className="mt-3 flex h-[109px] cursor-text flex-col rounded-xl border border-[#e4e4e4] bg-white px-[14px] pt-4 pb-[10px] focus-within:border-[#ff6f41]">
            <textarea
              value={content}
              maxLength={REVIEW_CONTENT_MAX_LENGTH}
              onChange={(event) => setContent(event.target.value)}
              aria-label="코스 총평"
              placeholder={REVIEW_CONTENT_PLACEHOLDER}
              className="scrollbar-hide min-h-0 w-full flex-1 resize-none bg-transparent text-[12px] leading-4 text-[#1c1c1c] outline-none placeholder:text-[#7f7f7f]"
            />
            {/*
              입력이 조용히 막히지 않도록 현재 글자 수를 보여준다. aria-live는
              쓰지 않는다 — 글자마다 다시 읽혀 스크린리더에서는 소음이 된다.
            */}
            <span className="shrink-0 text-right text-[11px] leading-[14px] text-[#a1a1a1]">
              {content.length}/{REVIEW_CONTENT_MAX_LENGTH}
            </span>
          </label>
        </section>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`mt-6 h-[43px] w-full rounded-xl text-[16px] font-semibold transition-colors disabled:cursor-not-allowed ${
            canSubmit ? 'bg-main-5 text-white' : 'bg-gray-2 text-gray-4'
          }`}
        >
          {isPending ? '수정 중...' : '수정 완료'}
        </button>
      </section>
    </div>,
    document.body
  );
}

export default ReviewEditModal;
