import { useState, type KeyboardEvent } from 'react';

import darkStar from '../../assets/icons/dark star.svg';
import star from '../../assets/icons/star.svg';

import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useLongPress } from '../../hooks/useLongPress';

import ReviewActionMenu from './ReviewActionMenu';
import ReviewEditModal from './ReviewEditModal';

// Figma 390 디자인 기준 리터럴 px (카드 자체 폭 290 기준)
const CARD_DESIGN_WIDTH = 342;
const CARD_DESIGN_HEIGHT = 286;
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
  onLongPress?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
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
  onLongPress,
  onEditClick,
  onDeleteClick,
  className = '',
}: ReviewCardProps) {
  const scale = useGlobalScale();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isClickable = Boolean(onClick || onLongPress);
  const displayedRating = Math.min(Math.max(Math.round(rating), 0), 5);
  // 길게 누르면 후기 상세, 짧게 누르면 코스 상세. 포인터로만 구분되므로
  // 키보드는 기존대로 onClick만 실행한다.
  const longPressHandlers = useLongPress({
    onLongPress: () => onLongPress?.(),
    onClick,
  });

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
        height: CARD_DESIGN_HEIGHT * scale,
      }}
    >
      <div
        style={{
          width: CARD_DESIGN_WIDTH,
          height: CARD_DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <article
          {...(isClickable ? longPressHandlers : {})}
          onKeyDown={handleKeyDown}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          className={`flex flex-col overflow-hidden bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)] select-none ${
            isClickable ? 'cursor-pointer' : ''
          }`}
          style={{ height: CARD_DESIGN_HEIGHT, borderRadius: CARD_RADIUS }}
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
                  onEditClick={() => {
                    setIsEditOpen(true);
                    onEditClick?.();
                  }}
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
              style={{ gap: PROFILE_GAP }}
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
      {isEditOpen ? (
        <ReviewEditModal
          review={{ images, content, rating }}
          onClose={() => setIsEditOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default ReviewCard;
