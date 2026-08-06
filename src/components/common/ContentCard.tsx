import { useLayoutEffect, useRef, useState } from 'react';
import {
  FaDog,
  FaHeart,
  FaPeopleGroup,
  FaPeopleRoof,
  FaUser,
} from 'react-icons/fa6';

import calendar from '../../assets/icons/calendar.svg';
import heart from '../../assets/icons/heart.svg';
import location from '../../assets/icons/location.svg';
import near from '../../assets/icons/near.svg';
import oheart from '../../assets/icons/oheart.svg';
import people from '../../assets/icons/people.svg';

import { useGlobalScale } from '../../hooks/useGlobalScale';

import TagChip, { type TagType } from './TagChip';

function getCompanionIcon(label?: string | null) {
  if (!label) return null;

  const key = label.trim().toUpperCase();

  if (key === 'SOLO' || key === 'ALONE' || label.includes('혼자')) {
    return FaUser;
  }
  if (key === 'FRIEND' || label.includes('친구')) {
    return FaPeopleGroup;
  }
  if (key === 'COUPLE' || label.includes('연인')) {
    return FaHeart;
  }
  if (key === 'FAMILY' || label.includes('가족')) {
    return FaPeopleRoof;
  }
  if (
    key === 'PET' ||
    label.includes('반려동물') ||
    label.includes('반려견')
  ) {
    return FaDog;
  }

  return null;
}

// 모든 수치는 Figma 390 디자인 기준(카드 자체 폭 163 기준) 리터럴 px
const CARD_DESIGN_WIDTH = 163;
const CARD_HEIGHT = 222;
const IMAGE_HEIGHT = 115;
const CONTENT_HEIGHT = 107;
const CONTENT_PADDING = 8;
const TITLE_SIZE = 14;
const INFO_SIZE = 12;
/** 아이콘 슬롯. 아이콘은 원본 비율 그대로 이 슬롯 가운데에 놓는다(중심 x = 15). */
const ICON_SIZE = 14;
const ICON_GAP = 2;
/** 태그 줄이 없는 카드(장소)는 남는 높이만큼 정보 줄을 넓게 벌린다. */
const INFO_MARGIN_TOP = 8;
const INFO_ROW_GAP = 4;
const INFO_MARGIN_TOP_WIDE = 17;
const INFO_ROW_GAP_WIDE = 8;
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
  /** 현 위치 기준 거리 줄(예: '현위치와 314KM'). 없으면 렌더링하지 않는다. */
  distanceInfo?: string;
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

/** 아이콘은 늘리지 않고 원본 크기 그대로 14px 슬롯 가운데에 놓는다. */
function InfoIcon({ src }: { src: string }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{ height: ICON_SIZE, width: ICON_SIZE }}
      aria-hidden="true"
    >
      <img src={src} alt="" />
    </span>
  );
}

function ContentCard({
  image,
  title,
  firstInfo,
  secondInfo,
  thirdInfo,
  distanceInfo,
  liked = false,
  className = '',
  tags,
  onClick,
  onLikeClick,
}: ContentCardProps) {
  const scale = useGlobalScale();

  const { visibleContainerRef, hiddenContainerRef, visibleCount } =
    useResponsiveTagCount(tags);

  const hasTags = Boolean(tags && tags.length > 0);
  const isClickable = Boolean(onClick);
  const hasCustomWidth = /(?:^|\s)(?:w-|min-w|max-w)/.test(className);

  return (
    <div
      className={`shrink-0 overflow-hidden ${className}`}
      style={{
        width: hasCustomWidth ? undefined : CARD_DESIGN_WIDTH * scale,
        height: CARD_HEIGHT * scale,
      }}
    >
      <div
        onClick={onClick}
        onKeyDown={(event) => {
          if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) {
            return;
          }

          event.preventDefault();
          onClick();
        }}
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
          <div
            className="flex flex-col"
            style={{
              marginTop: hasTags ? INFO_MARGIN_TOP : INFO_MARGIN_TOP_WIDE,
              gap: hasTags ? INFO_ROW_GAP : INFO_ROW_GAP_WIDE,
            }}
          >
            <div
              className="flex items-center"
              style={{ height: ICON_SIZE, gap: ICON_GAP }}
            >
              <InfoIcon src={calendar} />

              <span
                className="min-w-0 truncate leading-none font-medium text-[#7F7F7F]"
                style={{ fontSize: INFO_SIZE }}
              >
                {firstInfo}
              </span>
            </div>

            <div
              className="flex items-center"
              style={{ height: ICON_SIZE, gap: ICON_GAP }}
            >
              <InfoIcon src={location} />

              <span
                className="min-w-0 truncate leading-none font-medium text-[#7F7F7F]"
                style={{ fontSize: INFO_SIZE }}
              >
                {secondInfo}
              </span>

              {thirdInfo ? (
                <>
                  {(() => {
                    const CompanionIcon = getCompanionIcon(thirdInfo);
                    return CompanionIcon ? (
                      <span
                        className="flex shrink-0 items-center justify-center text-[#7F7F7F]"
                        style={{ height: ICON_SIZE, width: ICON_SIZE }}
                        aria-hidden="true"
                      >
                        <CompanionIcon style={{ fontSize: 11 }} />
                      </span>
                    ) : (
                      <InfoIcon src={people} />
                    );
                  })()}

                  <span
                    className="shrink-0 truncate leading-none font-medium text-[#7F7F7F]"
                    style={{ fontSize: INFO_SIZE }}
                  >
                    {thirdInfo}
                  </span>
                </>
              ) : null}
            </div>

            {distanceInfo ? (
              <div
                className="flex items-center"
                style={{ height: ICON_SIZE, gap: ICON_GAP }}
              >
                <InfoIcon src={near} />

                <span
                  className="min-w-0 truncate leading-none font-medium text-[#7F7F7F]"
                  style={{ fontSize: INFO_SIZE }}
                >
                  {distanceInfo}
                </span>
              </div>
            ) : null}
          </div>

          {/* Tags */}
          {hasTags && tags && (
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
