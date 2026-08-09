import type { KeyboardEvent } from 'react';

import darkStar from '../../assets/icons/dark star.svg';
import star from '../../assets/icons/star.svg';

import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useCardTap } from '../../hooks/useCardTap';

import ReviewActionMenu from './ReviewActionMenu';

// Figma 390 디자인 기준 리터럴 px (카드 자체 폭 290 기준)
const CARD_DESIGN_WIDTH = 342;
const CARD_DESIGN_HEIGHT = 286;
const COURSE_REVIEW_LIST_CARD_HEIGHT = 278;
const CARD_PADDING = 16;
const SECTION_GAP = 12;
const CARD_RADIUS = 12;

const IMAGE_SIZE = 129;
const IMAGE_GAP = 12;
const IMAGE_RADIUS = 10;

const TEXT_FONT_SIZE = 14;
const TEXT_LINE_HEIGHT = 18;

const AVATAR_SIZE = 28;
const PROFILE_GAP = 8;

const NAME_META_SIZE = 12;
const NAME_META_GAP = 2;

const STAR_SIZE = 14;
const STAR_GAP = 2;

export interface ReviewCardProps {
  images?: string[];
  courseTitle?: string;
  profileImage: string;
  nickname: string;
  meta: string;
  content: string;
  rating?: number;
  isMine?: boolean;
  onClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  variant?: 'default' | 'course-review-list';
  className?: string;
}

function ReviewCard({
  images = [],
  courseTitle,
  profileImage,
  nickname,
  meta,
  content,
  rating = 5,
  isMine = false,
  onClick,
  onEditClick,
  onDeleteClick,
  variant = 'default',
  className = '',
}: ReviewCardProps) {
  const scale = useGlobalScale();
  const isCourseReviewList = variant === 'course-review-list';
  const cardHeight = isCourseReviewList
    ? COURSE_REVIEW_LIST_CARD_HEIGHT
    : CARD_DESIGN_HEIGHT;

  const isClickable = Boolean(onClick);
  const displayedRating = Math.min(Math.max(Math.round(rating), 0), 5);
  const hasSingleImage = images.length === 1;
  const tapHandlers = useCardTap({ onTap: () => onClick?.() });

  // 탭은 포인터로만 판정하므로 키보드 경로를 따로 둔다.
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
      style={{
        width: CARD_DESIGN_WIDTH * scale,
        height: cardHeight * scale,
      }}
    >
      <div
        style={{
          width: CARD_DESIGN_WIDTH,
          height: cardHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <article
          {...(isClickable ? tapHandlers : {})}
          onKeyDown={handleKeyDown}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          className={`flex flex-col overflow-hidden bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)] select-none ${
            isClickable ? 'cursor-pointer' : ''
          }`}
          style={{ height: cardHeight, borderRadius: CARD_RADIUS }}
        >
          {/* Images: 카드 내부 가로 스크롤, 다음 이미지가 살짝 보이는 peek 효과 */}
          {images.length > 0 && (
            <div
              className={`flex scrollbar-hide ${
                hasSingleImage ? 'overflow-hidden' : 'overflow-x-auto'
              }`}
              style={{
                gap: IMAGE_GAP,
                paddingTop: CARD_PADDING,
                paddingLeft: CARD_PADDING,
                paddingRight: hasSingleImage ? CARD_PADDING : 0,
              }}
            >
              {images.map((src, index) => (
                <div
                  key={index}
                  className={`${
                    hasSingleImage ? 'min-w-0 flex-1' : 'shrink-0'
                  } overflow-hidden bg-[#D9D9D9]`}
                  style={{
                    width: hasSingleImage ? undefined : IMAGE_SIZE,
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
              {!hasSingleImage && (
                <div
                  className="shrink-0"
                  style={{ width: CARD_PADDING - IMAGE_GAP }}
                  aria-hidden="true"
                />
              )}
            </div>
          )}

          {/* Text + Profile */}
          <div
            className="flex flex-col"
            style={{
              gap: isCourseReviewList ? 4 : SECTION_GAP,
              padding: CARD_PADDING,
              paddingTop: CARD_PADDING,
            }}
          >
            <div className="flex h-[19px] min-w-0 items-start">
              <p
                className="truncate min-w-0 flex-1 font-medium text-[#1C1C1C]"
                style={{
                  fontSize: 16,
                  lineHeight: '19px',
                }}
              >
                {courseTitle ?? ''}
              </p>

              {isMine ? (
                <ReviewActionMenu
                  onEditClick={onEditClick}
                  onDeleteClick={onDeleteClick}
                />
              ) : null}
            </div>

            <p
              className="line-clamp-2 h-9 font-normal text-[#1C1C1C]"
              style={{
                fontSize: TEXT_FONT_SIZE,
                lineHeight: `${TEXT_LINE_HEIGHT}px`,
              }}
            >
              {content}
            </p>

            <div
              className="flex min-h-[30px] items-center"
              style={{
                gap: PROFILE_GAP,
                marginTop: isCourseReviewList ? 8 : 0,
              }}
            >
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
