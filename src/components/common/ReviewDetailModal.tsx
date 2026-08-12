import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import closeRounded from '../../assets/icons/close-rounded.svg';
import darkStar from '../../assets/icons/dark star.svg';
import star from '../../assets/icons/star.svg';

import ReviewerAvatar from './ReviewerAvatar';

const PHOTO_SIZE = 129;
const PHOTO_GAP = 12;
const STAR_SIZE = 14;

export interface ReviewDetailModalReview {
  images?: string[];
  content: string;
  profileImage: string;
  nickname: string;
  meta: string;
  rating?: number;
  isMine?: boolean;
}

export interface ReviewDetailModalProps {
  /** 열려 있을 때의 후기. 없으면 닫힌 상태다. */
  review: ReviewDetailModalReview | undefined;
  /** 코스명을 알 수 있을 때만 제목에 넣는다. */
  courseTitle?: string;
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
  review,
  courseTitle,
  onClose,
  onGoToCourse,
}: ReviewDetailModalProps) {
  const isOpen = Boolean(review);

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

  /**
   * 닫기를 브라우저의 click 생성에 의존하지 않는다.
   *
   * 이 모달은 카드를 길게 누르는 중에 손가락(마우스) 아래에서 열린다. 그
   * 포인터를 모달 위에서 떼면 pointerdown 대상(카드)과 pointerup 대상(모달)이
   * 달라 브라우저가 click을 만들지 않는다. 그러면 X도 딤도 반응하지 않고,
   * 딤이 화면 전체를 덮고 있어 페이지 전체가 멈춘 것처럼 보인다.
   *
   * 그래서 같은 요소에서 눌렀다 뗐는지를 직접 판정한다. 다만 pointerup으로
   * 닫으면 뒤따르는 click이 모달이 사라진 자리의 요소로 떨어지므로(click
   * through) 그 한 번은 삼킨다.
   */
  const pressedPointerIdRef = useRef<number | null>(null);

  const closeAndSwallowClick = useCallback(() => {
    const swallow = (event: MouseEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    document.addEventListener('click', swallow, true);
    window.setTimeout(
      () => document.removeEventListener('click', swallow, true),
      0
    );

    onClose();
  }, [onClose]);

  const handleTapStart = (event: { pointerId: number }) => {
    pressedPointerIdRef.current = event.pointerId;
  };

  const handleTapEnd = (event: { pointerId: number }) => {
    const isSamePointer = pressedPointerIdRef.current === event.pointerId;
    pressedPointerIdRef.current = null;

    // 모달이 열리기 전에 시작된 포인터는 여기서 걸러진다.
    if (isSamePointer) {
      closeAndSwallowClick();
    }
  };

  if (!review || typeof document === 'undefined') {
    return null;
  }

  const {
    images = [],
    content,
    profileImage,
    nickname,
    meta,
    rating = 5,
    isMine = false,
  } = review;
  const displayedRating = Math.min(Math.max(Math.round(rating), 0), 5);
  const title = courseTitle ? `${courseTitle}의 후기예요!` : '여행자의 후기예요!';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onPointerDown={handleTapStart}
      onPointerUp={handleTapEnd}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        // 모달 안을 누른 것은 딤까지 올라가지 않게 막는다.
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        className="relative w-full max-w-[342px] rounded-xl bg-[#f9f9f9] px-6 pt-11 pb-5 shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
      >
        <button
          type="button"
          aria-label="닫기"
          onPointerDown={handleTapStart}
          onPointerUp={handleTapEnd}
          // 키보드(Enter/Space)는 포인터 이벤트 없이 click만 보낸다.
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
          className="scrollbar-hide mt-4 max-h-40 overflow-y-auto text-[14px] leading-[18px] whitespace-pre-line text-[#1c1c1c] focus-visible:outline-none"
        >
          {content}
        </p>

        <div className="mt-3 flex min-h-[30px] items-center gap-2">
          <ReviewerAvatar src={profileImage} size={28} isMine={isMine} />

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
