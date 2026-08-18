import { useState } from 'react';
import { IoChevronDown } from 'react-icons/io5';

import heart from '../../../assets/icons/heart.svg';
import locationOn from '../../../assets/icons/location-on.svg';
import oheart from '../../../assets/icons/oheart.svg';
import { useScaleFrame } from '../../../hooks/useScaleFrame';
import {
  formatOperatingDay,
  getTodayOperatingDay,
  hasSameOperatingHoursEveryDay,
  type OperatingDay,
} from '../../../utils/operatingHours';

const CARD_DESIGN_WIDTH = 342;
const CARD_HEIGHT = 97;
const CARD_PADDING = 12; // 추정값, 실측 필요
const LOCATION_ICON_SIZE = 24;
const CONTENT_GAP = 12; // 추정값, 실측 필요
const TITLE_SIZE = 14;
const TITLE_LINE_HEIGHT = 20;
const META_SIZE = 12;
const META_LINE_HEIGHT = 12;
const META_GAP = 4;
const HEART_SIZE = 20;
const HOURS_CHEVRON_SIZE = 14;
const HOURS_CHEVRON_GAP = 2;

export interface DetailPlaceCardProps {
  title: string;
  address: string;
  hours: string;
  operatingDays?: readonly OperatingDay[];
  liked?: boolean;
  onClick?: () => void;
  onLikeClick?: () => void;
}

function DetailPlaceCard({
  title,
  address,
  hours,
  operatingDays = [],
  liked = false,
  onClick,
  onLikeClick,
}: DetailPlaceCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  const isClickable = Boolean(onClick);
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const todayOperatingDay = getTodayOperatingDay(operatingDays);
  const remainingOperatingDays = todayOperatingDay
    ? operatingDays.filter((day) => day !== todayOperatingDay)
    : operatingDays;
  const canExpandHours =
    !hasSameOperatingHoursEveryDay(operatingDays) &&
    remainingOperatingDays.length > 0;
  const displayedHours = todayOperatingDay
    ? formatOperatingDay(todayOperatingDay)
    : hours;

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <div
        ref={innerRef}
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className={`relative flex items-start rounded-xl bg-white ${
          isClickable ? 'cursor-pointer' : ''
        }`}
        style={{
          width: CARD_DESIGN_WIDTH,
          ...(isHoursOpen ? { minHeight: CARD_HEIGHT } : { height: CARD_HEIGHT }),
          padding: CARD_PADDING,
          gap: CONTENT_GAP,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <img
          src={locationOn}
          alt=""
          aria-hidden="true"
          className="shrink-0"
          style={{ width: LOCATION_ICON_SIZE, height: LOCATION_ICON_SIZE }}
        />

        <div
          className="flex min-w-0 flex-1 flex-col"
          style={{ gap: META_GAP }}
        >
          <h3
            className="truncate font-semibold text-black"
            style={{
              fontSize: TITLE_SIZE,
              lineHeight: `${TITLE_LINE_HEIGHT}px`,
            }}
          >
            {title}
          </h3>

          <p
            className="font-regular text-gray-4 truncate"
            style={{
              fontSize: META_SIZE,
              lineHeight: `${META_LINE_HEIGHT}px`,
            }}
          >
            {address}
          </p>

          {canExpandHours ? (
            <div>
              <button
                type="button"
                aria-expanded={isHoursOpen}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsHoursOpen((open) => !open);
                }}
                className="text-gray-3 flex max-w-full items-center tabular-nums"
                style={{ gap: HOURS_CHEVRON_GAP }}
              >
                <span
                  className="truncate"
                  style={{
                    fontSize: META_SIZE,
                    lineHeight: `${META_LINE_HEIGHT}px`,
                  }}
                >
                  {displayedHours}
                </span>
                <IoChevronDown
                  aria-hidden="true"
                  className={`shrink-0 transition-transform ${
                    isHoursOpen ? 'rotate-180' : ''
                  }`}
                  style={{ fontSize: HOURS_CHEVRON_SIZE }}
                />
              </button>

              {isHoursOpen ? (
                  <ul
                    className="tabular-nums"
                    style={{ marginTop: META_GAP }}
                  >
                  {remainingOperatingDays.map((day) => (
                    <li
                      key={day.dayOfWeek}
                      className="text-gray-3"
                      style={{
                        fontSize: META_SIZE,
                        lineHeight: `${META_LINE_HEIGHT}px`,
                      }}
                    >
                      {formatOperatingDay(day)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p
              className="font-regular text-gray-3 truncate"
              style={{
                fontSize: META_SIZE,
                lineHeight: `${META_LINE_HEIGHT}px`,
              }}
            >
              {hours}
            </p>
          )}
        </div>

        <button
          type="button"
          aria-pressed={liked}
          onClick={(event) => {
            event.stopPropagation();
            onLikeClick?.();
          }}
          className="absolute"
          style={{ top: CARD_PADDING, right: CARD_PADDING }}
        >
          <img
            src={liked ? oheart : heart}
            alt="좋아요"
            style={{ width: HEART_SIZE, height: HEART_SIZE }}
          />
        </button>
      </div>
    </div>
  );
}

export default DetailPlaceCard;
