import { useLayoutEffect, useRef, useState } from 'react';

import calendar from '../../assets/icons/calendar.svg';
import heart from '../../assets/icons/heart.svg';
import location from '../../assets/icons/location.svg';
import oheart from '../../assets/icons/oheart.svg';
import people from '../../assets/icons/people.svg';

import { useGlobalScale } from '../../hooks/useGlobalScale';

import TagChip, { type TagType } from './TagChip';

// 모든 수치는 Figma 390 디자인 기준(카드 자체 폭 163 기준) 리터럴 px
const CARD_DESIGN_WIDTH = 163;
const CARD_HEIGHT = 222;
const IMAGE_HEIGHT = 115;
const CONTENT_HEIGHT = 107;
const CONTENT_PADDING = 8;
const TITLE_SIZE = 14;
const INFO_SIZE = 12;
const ICON_SIZE = 14;
const HEART_SIZE = 16;
const HEART_TOP = 8;
const HEART_RIGHT = 8;
const TAG_HEIGHT = 20;
const TAG_GAP = 4;

interface ContentCardProps {
  image: string | null;
  title: string;
  firstInfo: string;
  secondInfo: string;
  /** 두 번째 정보 줄에 함께 붙는 보조 정보(예: 동행 유형). 없으면 렌더링하지 않는다. */
  thirdInfo?: string;
  liked?: boolean;
  className?: string;
  tags?: TagType[];
  onClick?: () => void;
  onLikeClick?: () => void;
}

function useResponsiveTagCount(tags: TagType[] | undefined) {
  const visibleContainerRef = useRef<HTMLDivElement>(null);
  const hiddenContainerRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(0);

  const tagsKey = tags?.join('|') ?? '';

  useLayoutEffect(() => {
    const container = visibleContainerRef.current;
    const hidden = hiddenContainerRef.current;

    if (!container || !hidden || !tags || tags.length === 0) {
      setVisibleCount(0);
      return;
    }

    const recalculate = () => {
      const elements = Array.from(hidden.children) as HTMLElement[];
      const widths = elements.map((el) => el.getBoundingClientRect().width);

      if (widths.length === 0 || widths.some((w) => w === 0)) {
        return;
      }

      const style = getComputedStyle(container);
      const gap = Number.parseFloat(style.columnGap || style.gap || '0') || 0;

      const containerWidth = container.getBoundingClientRect().width;
      const EPSILON = 0.5;

      let total = 0;
      let count = 0;

      for (let i = 0; i < widths.length; i++) {
        const width = widths[i];
        const next = count === 0 ? width : total + gap + width;

        if (next > containerWidth + EPSILON) {
          break;
        }

        total = next;
        count++;
      }

      setVisibleCount(count);
    };

    recalculate();

    const observer = new ResizeObserver(recalculate);
    observer.observe(container);
    observer.observe(hidden);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsKey]);

  return { visibleContainerRef, hiddenContainerRef, visibleCount };
}

function ContentCard({
  image,
  title,
  firstInfo,
  secondInfo,
  thirdInfo,
  liked = false,
  className = '',
  tags,
  onClick,
  onLikeClick,
}: ContentCardProps) {
  const scale = useGlobalScale();

  const { visibleContainerRef, hiddenContainerRef, visibleCount } =
    useResponsiveTagCount(tags);

  const isClickable = Boolean(onClick);

  return (
    <div
      className={`shrink-0 overflow-hidden ${className}`}
      style={{
        width: CARD_DESIGN_WIDTH * scale,
        height: CARD_HEIGHT * scale,
      }}
    >
      <div
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className={`flex flex-col overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)] ${isClickable ? 'cursor-pointer' : ''} `}
        style={{
          width: CARD_DESIGN_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden rounded-[8px]">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full object-cover"
              style={{ height: IMAGE_HEIGHT }}
            />
          ) : (
            <div
              className="w-full bg-[#EAEAEA]"
              style={{ height: IMAGE_HEIGHT }}
            />
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLikeClick?.();
            }}
            className="absolute"
            style={{ right: HEART_RIGHT, top: HEART_TOP }}
          >
            <img
              src={liked ? oheart : heart}
              alt="좋아요"
              style={{ height: HEART_SIZE, width: HEART_SIZE }}
            />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex min-w-0 flex-col"
          style={{ height: CONTENT_HEIGHT, padding: CONTENT_PADDING }}
        >
          {/* Title */}
          <h3
            className="truncate leading-none font-medium text-[#1C1C1C]"
            style={{ fontSize: TITLE_SIZE }}
          >
            {title}
          </h3>

          {/* Info */}
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <img
                src={calendar}
                alt=""
                aria-hidden="true"
                className="shrink-0"
                style={{ height: ICON_SIZE, width: ICON_SIZE }}
              />

              <span
                className="min-w-0 truncate leading-none font-medium text-[#7F7F7F]"
                style={{ fontSize: INFO_SIZE }}
              >
                {firstInfo}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <img
                src={location}
                alt=""
                aria-hidden="true"
                className="shrink-0"
                style={{ height: ICON_SIZE, width: ICON_SIZE }}
              />

              <span
                className="min-w-0 truncate leading-none font-medium text-[#7F7F7F]"
                style={{ fontSize: INFO_SIZE }}
              >
                {secondInfo}
              </span>

              {thirdInfo ? (
                <>
                  <img
                    src={people}
                    alt=""
                    aria-hidden="true"
                    className="shrink-0"
                    style={{ height: ICON_SIZE, width: ICON_SIZE }}
                  />

                  <span
                    className="shrink-0 truncate leading-none font-medium text-[#7F7F7F]"
                    style={{ fontSize: INFO_SIZE }}
                  >
                    {thirdInfo}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <>
              <div
                ref={hiddenContainerRef}
                className="invisible absolute flex"
                style={{ gap: TAG_GAP }}
                aria-hidden="true"
              >
                {tags.map((tag, index) => (
                  <TagChip
                    key={`measure-${tag}-${index}`}
                    type={tag}
                    className="w-auto"
                    style={{ height: TAG_HEIGHT }}
                  />
                ))}
              </div>

              <div className="mt-auto border-t border-[#E4E4E4] pt-2">
                <div
                  ref={visibleContainerRef}
                  className="flex flex-nowrap items-center overflow-hidden"
                  style={{ gap: TAG_GAP }}
                >
                  {tags.slice(0, visibleCount).map((tag, index) => (
                    <TagChip
                      key={`${tag}-${index}`}
                      type={tag}
                      className="w-auto"
                      style={{ height: TAG_HEIGHT }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentCard;
