import type { KeyboardEvent } from 'react';

import more from '../../assets/icons/more.svg';
import darkStar from '../../assets/icons/dark star.svg';
import star from '../../assets/icons/star.svg';

import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useMeasuredScaledHeight } from '../../hooks/useMeasuredScaledHeight';

// Figma 390 디자인 기준 리터럴 px (카드 자체 폭 290 기준)
const CARD_DESIGN_WIDTH = 342;
const CARD_PADDING = 16;
const SECTION_GAP = 12;
const CARD_RADIUS = 16; // Figma에 명시된 값이 없어 앱 다른 카드들과 톤을 맞춘 값

const IMAGE_SIZE = 129;
const IMAGE_GAP = 12;
const IMAGE_RADIUS = 10;

const TEXT_FONT_SIZE = 14;
const TEXT_LINE_HEIGHT = 17;

const AVATAR_SIZE = 28;
const PROFILE_GAP = 8;

const NAME_META_SIZE = 12;
const NAME_META_GAP = 2;

const STAR_SIZE = 14;
const STAR_GAP = 2;

export interface ReviewCardProps {
  images?: string[];
  profileImage: string;
  nickname: string;
  meta: string;
  content: string;
  rating?: number;
  isMine?: boolean;
  onClick?: () => void;
  onMoreClick?: () => void;
  className?: string;
}

function ReviewCard({
  images = [],
  profileImage,
  nickname,
  meta,
  content,
  rating = 5,
  isMine = false,
  onClick,
  onMoreClick,
  className = '',
}: ReviewCardProps) {
  const scale = useGlobalScale();
  const { innerRef, scaledHeight } = useMeasuredScaledHeight(scale);

  const isClickable = Boolean(onClick);
  const displayedRating = Math.min(Math.max(Math.round(rating), 0), 5);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick || event.currentTarget !== event.target) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`shrink-0 overflow-hidden ${className}`}
      style={{ width: CARD_DESIGN_WIDTH * scale, height: scaledHeight }}
    >
      <div
        ref={innerRef}
        style={{
          width: CARD_DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <article
          onClick={onClick}
          onKeyDown={handleKeyDown}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          className={`flex flex-col overflow-hidden bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)] ${
            isClickable ? 'cursor-pointer' : ''
          }`}
          style={{ borderRadius: CARD_RADIUS }}
        >
          {/* Images: 카드 내부 가로 스크롤, 다음 이미지가 살짝 보이는 peek 효과 */}
          {images.length > 0 && (
            <div
              className="flex overflow-x-auto scrollbar-hide"
              style={{
                gap: IMAGE_GAP,
                paddingTop: CARD_PADDING,
                paddingLeft: CARD_PADDING,
              }}
            >
              {images.map((src, index) => (
                <div
                  key={index}
                  className="shrink-0 overflow-hidden bg-[#D9D9D9]"
                  style={{
                    width: IMAGE_SIZE,
                    height: IMAGE_SIZE,
                    borderRadius: IMAGE_RADIUS,
                  }}
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

              {/* 마지막 이미지 뒤에도 카드 패딩만큼 여백 확보 */}
              <div
                className="shrink-0"
                style={{ width: CARD_PADDING - IMAGE_GAP }}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Text + Profile */}
          <div
            className="flex flex-col"
            style={{
              gap: SECTION_GAP,
              padding: CARD_PADDING,
              paddingTop: images.length > 0 ? SECTION_GAP : CARD_PADDING,
            }}
          >
            <div className="flex min-w-0 items-start">
              <p
                className="line-clamp-2 min-w-0 flex-1 font-normal text-[#1C1C1C]"
                style={{
                  fontSize: TEXT_FONT_SIZE,
                  lineHeight: `${TEXT_LINE_HEIGHT}px`,
                }}
              >
                {content}
              </p>

              {isMine && onMoreClick ? (
                <button
                  type="button"
                  aria-label="리뷰 메뉴"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMoreClick?.();
                  }}
                  className="-mt-[3px] -mr-[3px] ml-2 flex shrink-0 items-center justify-center"
                  style={{ width: 20, height: 20 }}
                >
                  <img
                    src={more}
                    alt=""
                    aria-hidden="true"
                    style={{ width: 20, height: 20 }}
                  />
                </button>
              ) : null}
            </div>

            <div className="flex items-center" style={{ gap: PROFILE_GAP }}>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={`${nickname} 프로필`}
                  className="shrink-0 rounded-full object-cover"
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                />
              ) : (
                <div
                  className="shrink-0 rounded-full bg-[#EAEAEA]"
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                />
              )}

              <div
                className="flex min-w-0 flex-col"
                style={{ gap: NAME_META_GAP }}
              >
                <div className="flex min-w-0 items-center">
                  <span
                    className="truncate font-medium leading-none text-[#1C1C1C]"
                    style={{ fontSize: NAME_META_SIZE }}
                  >
                    {nickname}
                  </span>

                  <span
                    className="mx-[4px] shrink-0 font-normal leading-none text-[#7F7F7F]"
                    style={{ fontSize: NAME_META_SIZE }}
                  >
                    ·
                  </span>

                  <span
                    className="truncate font-normal leading-none text-[#7F7F7F]"
                    style={{ fontSize: NAME_META_SIZE }}
                  >
                    {meta}
                  </span>
                </div>

                <div
                  className="flex items-center"
                  style={{ gap: STAR_GAP }}
                >
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
          </div>
        </article>
      </div>
    </div>
  );
}

export default ReviewCard;
