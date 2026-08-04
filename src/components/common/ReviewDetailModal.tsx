import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import closeRounded from '../../assets/icons/close-rounded.svg';
import darkStar from '../../assets/icons/dark star.svg';
import star from '../../assets/icons/star.svg';

const PHOTO_SIZE = 129;
const PHOTO_GAP = 12;
const STAR_SIZE = 14;

export interface ReviewDetailModalProps {
  isOpen: boolean;
  /** 코스명을 알 수 있을 때만 제목에 넣는다. 홈 후기 응답에는 코스 정보가 없다. */
  courseTitle?: string;
  images?: string[];
  content: string;
  profileImage: string;
  nickname: string;
  meta: string;
  rating?: number;
  onClose: () => void;
  /** 코스를 특정할 수 있을 때만 '코스 바로가기'가 나온다. */
  onGoToCourse?: () => void;
}

/**
 * 후기 카드를 길게 눌렀을 때 뜨는 후기 상세 모달.
 *
 * 카드에서는 사진과 본문이 잘려 보이므로, 여기서는 자르지 않고 전부 보여준다.
 */
function ReviewDetailModal({
  isOpen,
  courseTitle,
  images = [],
  content,
  profileImage,
  nickname,
  meta,
  rating = 5,
  onClose,
  onGoToCourse,
}: ReviewDetailModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  const displayedRating = Math.min(Math.max(Math.round(rating), 0), 5);
  const title = courseTitle ? `${courseTitle}의 후기예요!` : '여행자의 후기예요!';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-[342px] rounded-xl bg-[#f9f9f9] px-6 pt-11 pb-5 shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-5 right-5 flex size-6 items-center justify-center"
        >
          <img
            src={closeRounded}
            alt=""
            aria-hidden="true"
            className="size-6"
          />
        </button>

        <h2 className="pr-8 text-[18px] leading-[21px] font-semibold text-[#1c1c1c]">
          {title}
        </h2>
        <p className="mt-1 text-[14px] leading-[17px] font-normal text-[#7f7f7f]">
          직접 다녀온 여행자의 생생한 후기를 확인해보세요
        </p>

        {images.length > 0 && (
          <div
            className="scrollbar-hide mt-3 flex overflow-x-auto"
            style={{ gap: PHOTO_GAP }}
          >
            {images.map((src, index) => (
              <div
                key={index}
                className="shrink-0 overflow-hidden rounded-[10px] bg-[#e4e4e4]"
                style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
              >
                {src && (
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))}
            {/* 마지막 사진 뒤에도 모달 패딩만큼 여백을 남긴다. */}
          </div>
        )}

        <p
          tabIndex={0}
          className="scrollbar-hide mt-4 h-9 overflow-y-auto text-[14px] leading-[18px] whitespace-pre-line text-[#1c1c1c] focus-visible:outline-none"
        >
          {content}
        </p>

        <div className="mt-3 flex min-h-[30px] items-center gap-2">
          {profileImage ? (
            <img
              src={profileImage}
              alt={`${nickname} 프로필`}
              className="size-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="size-7 shrink-0 rounded-full bg-[#e4e4e4]" />
          )}

          <div className="min-w-0">
            <p className="truncate text-[12px] leading-none">
              <span className="font-medium text-[#1c1c1c]">{nickname}</span>
              {meta && (
                <span className="font-normal text-[#7f7f7f]"> · {meta}</span>
              )}
            </p>
            <div className="mt-[2px] flex items-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <img
                  key={index}
                  src={index < displayedRating ? star : darkStar}
                  alt=""
                  aria-hidden="true"
                  className={index < displayedRating ? '' : 'scale-[1.42]'}
                  style={{ width: STAR_SIZE, height: STAR_SIZE }}
                />
              ))}
            </div>
          </div>
        </div>

        {onGoToCourse && (
          <button
            type="button"
            onClick={onGoToCourse}
            className="bg-main-5 mt-5 h-[43px] w-full rounded-xl text-[16px] font-semibold text-white"
          >
            코스 바로가기
          </button>
        )}
      </section>
    </div>,
    document.body
  );
}

export default ReviewDetailModal;
