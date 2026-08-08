import type { KeyboardEvent } from 'react';

import calendar from '../../assets/icons/calendar.svg';
import darkStar from '../../assets/icons/dark star.svg';
import location from '../../assets/icons/location.svg';
import people from '../../assets/icons/people.svg';
import star from '../../assets/icons/star.svg';
import { useLongPress } from '../../hooks/useLongPress';
import { useScaleFrame } from '../../hooks/useScaleFrame';
import { useVisibleItemCount } from '../../hooks/useVisibleItemCount';
import type { TagId } from '../../types/tag.type';

import ReviewActionMenu from './ReviewActionMenu';
import TagChip from './TagChip';

const CARD_DESIGN_WIDTH = 342;
const CARD_HEIGHT = 166;

export interface CourseReviewCardProps {
  image: string;
  title: string;
  duration: string;
  /** 이동 수단 라벨(걷기·자동차). 코스 타입(OFFICIAL·LOCAL)과 다르다. */
  transport: string;
  // 리뷰 목록 API의 코스 정보에는 동행·해시태그가 없어, 값이 없으면 해당
  // 항목만 빼고 그린다. 백엔드에 추가 요청해 둔 상태다.
  companion?: string;
  tags?: TagId[];
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
}

function CourseReviewCard({
  image,
  title,
  duration,
  transport,
  companion,
  tags = [],
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
}: CourseReviewCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);
  const isClickable = Boolean(onClick || onLongPress);
  const displayedRating = Math.min(Math.max(Math.round(rating), 0), 5);
  const longPressHandlers = useLongPress({
    onLongPress: () => onLongPress?.(),
    onClick,
  });

  // 길게 누르기는 포인터로만 구분되므로, 키보드에서는 카드를 눌렀을 때 할 수
  // 있는 일을 실행한다. 짧게 누르기가 없는 화면(홈)에서는 후기 상세를 연다.
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const activate = onClick ?? onLongPress;

    if (!activate || event.currentTarget !== event.target) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  };

  const metaItems = [
    { key: 'duration', icon: calendar, label: duration },
    { key: 'transport', icon: location, label: transport },
    { key: 'companion', icon: people, label: companion },
  ].filter((item) => Boolean(item.label));

  const {
    containerRef: metaContainerRef,
    hiddenRef: hiddenMetaRef,
    visibleCount: visibleMetaCount,
  } = useVisibleItemCount(
    metaItems.map((item) => item.label).join('|'),
    metaItems.length,
  );

  const {
    containerRef: tagContainerRef,
    hiddenRef: hiddenTagRef,
    visibleCount: visibleTagCount,
  } = useVisibleItemCount(tags.join('|'), tags.length);

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <article
        ref={innerRef}
        {...(isClickable ? longPressHandlers : {})}
        onKeyDown={handleKeyDown}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className={`relative overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)] select-none ${
          isClickable ? 'cursor-pointer' : ''
        }`}
        style={{
          width: CARD_DESIGN_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="flex gap-4 p-3">
          <div className="h-[88px] w-[119px] shrink-0 overflow-hidden rounded-lg bg-[#E4E4E4]">
            {image && (
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="relative min-w-0 flex-1 pt-1 pr-5">
            <h2 className="truncate text-[16px] leading-none font-medium text-[#1C1C1C]">
              {title}
            </h2>

            {/* 메타: 폭 측정 전용 */}
            <div
              ref={hiddenMetaRef}
              className="invisible absolute flex gap-1"
              aria-hidden="true"
            >
              {metaItems.map((item) => (
                <span
                  key={`measure-${item.key}`}
                  className="flex items-center gap-[2px] text-[12px] leading-none font-medium whitespace-nowrap text-[#7F7F7F]"
                >
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-[14px] w-[14px] shrink-0"
                  />
                  {item.label}
                </span>
              ))}
            </div>

            {/* 메타: 한 줄에 들어가는 만큼만 */}
            <div
              ref={metaContainerRef}
              className="mt-2 flex h-[14px] flex-nowrap items-center gap-1 overflow-hidden"
            >
              {metaItems.slice(0, visibleMetaCount).map((item) => (
                <span
                  key={item.key}
                  className="flex shrink-0 items-center gap-[2px] text-[12px] leading-none font-medium whitespace-nowrap text-[#7F7F7F]"
                >
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-[14px] w-[14px] shrink-0"
                  />
                  {item.label}
                </span>
              ))}
            </div>

            {/* 태그: 폭 측정 전용 */}
            <div
              ref={hiddenTagRef}
              className="invisible absolute flex gap-1"
              aria-hidden="true"
            >
              {tags.map((tag, index) => (
                <TagChip
                  key={`measure-${tag}-${index}`}
                  type={tag}
                  className="h-5 w-auto"
                />
              ))}
            </div>

            {/* 태그: 한 줄에 들어가는 만큼만 */}
            <div
              ref={tagContainerRef}
              className="mt-[15px] flex h-5 flex-nowrap items-center gap-1 overflow-hidden"
            >
              {tags.slice(0, visibleTagCount).map((tag, index) => (
                <TagChip
                  key={`${tag}-${index}`}
                  type={tag}
                  className="h-5 w-auto"
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
            triggerClassName="absolute top-3 left-[310px]"
          />
        )}

        <div className="mx-4 border-t border-[#E4E4E4]" />

        <div className="flex items-center justify-between px-4 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${nickname} 프로필`}
                className="h-7 w-7 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="h-7 w-7 shrink-0 rounded-full bg-[#E4E4E4]" />
            )}

            <div className="min-w-0">
              <p className="truncate text-[12px] leading-none">
                <span className="font-semibold text-[#1C1C1C]">{nickname}</span>
                <span className="font-normal text-[#7F7F7F]"> · {meta}</span>
              </p>
              <div className="mt-[2px] flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <img
                    key={index}
                  src={index < displayedRating ? star : darkStar}
                  alt=""
                  aria-hidden="true"
                  className={`h-[14px] w-[14px] ${
                    index < displayedRating ? '' : 'scale-[1.42]'
                  }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <p className="ml-3 line-clamp-2 w-[178px] text-[12px] leading-[15px] text-[#1C1C1C]">
            {content}
          </p>
        </div>
      </article>
    </div>
  );
}

export default CourseReviewCard;
