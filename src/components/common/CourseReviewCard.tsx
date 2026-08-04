import type { KeyboardEvent } from 'react';

import calendar from '../../assets/icons/calendar.svg';
import darkStar from '../../assets/icons/dark star.svg';
import heart from '../../assets/icons/heart.svg';
import location from '../../assets/icons/location.svg';
import oheart from '../../assets/icons/oheart.svg';
import people from '../../assets/icons/people.svg';
import star from '../../assets/icons/star.svg';
import { useScaleFrame } from '../../hooks/useScaleFrame';
import type { TagId } from '../../types/tag.type';

import TagChip from './TagChip';

const CARD_DESIGN_WIDTH = 342;
const CARD_HEIGHT = 166;

export interface CourseReviewCardProps {
  image: string;
  title: string;
  duration: string;
  courseType: string;
  companion: string;
  tags: TagId[];
  profileImage: string;
  nickname: string;
  meta: string;
  content: string;
  rating?: number;
  liked?: boolean;
  onClick?: () => void;
  onLikeClick?: () => void;
}

function CourseReviewCard({
  image,
  title,
  duration,
  courseType,
  companion,
  tags,
  profileImage,
  nickname,
  meta,
  content,
  rating = 5,
  liked = false,
  onClick,
  onLikeClick,
}: CourseReviewCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);
  const isClickable = Boolean(onClick);
  const displayedRating = Math.min(Math.max(Math.round(rating), 0), 5);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const metaItems = [
    { icon: calendar, label: duration },
    { icon: location, label: courseType },
    { icon: people, label: companion },
  ];

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <article
        ref={innerRef}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className={`relative overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)] ${
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

          <div className="min-w-0 flex-1 pt-1 pr-5">
            <h2 className="truncate text-[16px] leading-none font-medium text-[#1C1C1C]">
              {title}
            </h2>

            <div className="mt-2 flex items-center gap-1 overflow-hidden">
              {metaItems.map((item) => (
                <span
                  key={item.label}
                  className="flex shrink-0 items-center gap-[2px] text-[12px] leading-none font-medium whitespace-nowrap text-[#7F7F7F]"
                >
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-[14px] w-[14px]"
                  />
                  {item.label}
                </span>
              ))}
            </div>

            <div className="mt-[15px] flex h-5 items-center gap-1 overflow-hidden">
              {tags.map((tag) => (
                <TagChip key={tag} type={tag} className="h-5 w-auto" />
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label={liked ? '좋아요 취소' : '좋아요'}
          aria-pressed={liked}
          onClick={(event) => {
            event.stopPropagation();
            onLikeClick?.();
          }}
          className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center"
        >
          <img src={liked ? oheart : heart} alt="" aria-hidden="true" />
        </button>

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
                    className="h-[14px] w-[14px]"
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
