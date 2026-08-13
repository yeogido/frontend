import type { KeyboardEvent } from 'react';

import darkStar from '../../assets/icons/dark star.svg';
import star from '../../assets/icons/star.svg';
import { useCardTap } from '../../hooks/useCardTap';
import { useScaleFrame } from '../../hooks/useScaleFrame';

import ReviewActionMenu from './ReviewActionMenu';
import ReviewerAvatar from './ReviewerAvatar';
import ReviewerName from './ReviewerName';

// 모든 수치는 Figma 390 디자인 기준(카드 자체 폭 342) 리터럴 px.
// 개별 vw 계산 대신 useScaleFrame이 전체를 한 번에 scale한다.
const CARD_DESIGN_WIDTH = 342;
const CARD_HEIGHT = 100;
const CONTENT_PADDING_X = 16;
const CONTENT_PADDING_TOP = 12;
const CONTENT_PADDING_BOTTOM = 12;
/** 더보기(⋯)가 있는 카드는 본문이 그 아래로 들어가지 않게 오른쪽을 더 비운다. */
const MENU_GUTTER = 24;
const CONTENT_GAP = 12;
const TEXT_SIZE = 14;
/** 본문에 주어진 높이(36)가 딱 두 줄이 되도록 잡은 값. */
const TEXT_LINE_HEIGHT = 18;
const AVATAR_SIZE = 28;
const PROFILE_GAP = 8;
const NAME_SIZE = 12;
const NAME_META_GAP = 2;
const STAR_SIZE = 14;
const STAR_GAP = 2;

export interface ReviewTextCardProps {
  content: string;
  profileImage: string;
  nickname: string;
  /** 작성자 메타 문구("20대 여"). */
  meta: string;
  rating?: number;
  /** 본인이 쓴 후기면 우측 상단에 더보기(수정·삭제)가 뜬다. */
  isMine?: boolean;
  onClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  /** 바깥 상자에 붙는다. 카드 배경을 화면에 맞추는 용도로 쓴다. */
  className?: string;
}

/**
 * 사진 없이 본문만 보여주는 후기 카드.
 *
 * 사진이 있는 후기는 ReviewCard, 코스 정보까지 함께 그리는 목록은
 * CourseReviewCard를 쓴다.
 */
function ReviewTextCard({
  content,
  profileImage,
  nickname,
  meta,
  rating = 5,
  isMine = false,
  onClick,
  onEditClick,
  onDeleteClick,
  className = '',
}: ReviewTextCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);
  const isClickable = Boolean(onClick);
  const displayedRating = Math.min(Math.max(Math.round(rating), 0), 5);
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
      ref={outerRef}
      className={`w-full overflow-hidden ${className}`}
      style={{ height: scaledHeight }}
    >
      <article
        ref={innerRef}
        {...(isClickable ? tapHandlers : {})}
        onKeyDown={handleKeyDown}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={`${nickname}님의 후기`}
        className={`bg-white relative flex flex-col overflow-hidden rounded-xl shadow-[0_1px_5px_rgba(0,0,0,0.07)] select-none ${
          isClickable ? 'cursor-pointer' : ''
        }`}
        style={{
          width: CARD_DESIGN_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          paddingTop: CONTENT_PADDING_TOP,
          paddingLeft: CONTENT_PADDING_X,
          paddingRight: CONTENT_PADDING_X + (isMine ? MENU_GUTTER : 0),
          paddingBottom: CONTENT_PADDING_BOTTOM,
          gap: CONTENT_GAP,
        }}
      >
        {/* 본문은 남는 높이를 다 쓰고, 넘치면 세 줄에서 자른다. */}
        <p
          className="text-black line-clamp-2 min-h-0 flex-1"
          style={{
            fontSize: TEXT_SIZE,
            lineHeight: `${TEXT_LINE_HEIGHT}px`,
          }}
        >
          {content}
        </p>

        <div
          className="flex shrink-0 items-center"
          style={{ gap: PROFILE_GAP }}
        >
          <ReviewerAvatar
            src={profileImage}
            size={AVATAR_SIZE}
            isMine={isMine}
          />

          <div
            className="flex min-w-0 flex-col"
            style={{ gap: NAME_META_GAP }}
          >
            <p className="flex items-baseline leading-none" style={{ fontSize: NAME_SIZE }}>
              <ReviewerName
                nickname={nickname}
                className="font-medium text-black"
              />
              <span className="shrink-0 text-gray-4 font-normal"> · {meta}</span>
            </p>

            <div className="flex items-center" style={{ gap: STAR_GAP }}>
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

        {/* 카드가 overflow-hidden이라 메뉴 패널은 포털로 뜬다. */}
        {isMine && (
          <ReviewActionMenu
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            triggerClassName="absolute top-3 right-3"
          />
        )}
      </article>
    </div>
  );
}

export default ReviewTextCard;
