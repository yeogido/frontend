import { useState } from 'react';
import { IoChevronDown } from 'react-icons/io5';

import call from '../../../assets/icons/call.svg';
import language from '../../../assets/icons/language.svg';
import locationPin from '../../../assets/icons/location-pin.svg';
import schedule from '../../../assets/icons/schedule.svg';
import { useScaleFrame } from '../../../hooks/useScaleFrame';
import {
  formatOperatingDay,
  getTodayOperatingDay,
  hasSameOperatingHoursEveryDay,
  type OperatingDay,
} from '../../../utils/operatingHours';

const CARD_DESIGN_WIDTH = 342;
const CARD_PADDING_X = 20;
const CARD_PADDING_Y = 16;
const ROW_GAP = 5; // 피그마 스펙은 8이지만, 실제 렌더링 시 시각적으로 맞춰본 값(스케일적용)
const ICON_SIZE = 16;
const ICON_TEXT_GAP = 12;
const TEXT_SIZE = 14;
const TEXT_LINE_HEIGHT = 22;
const HOURS_CHEVRON_SIZE = 16;

export interface DetailInfoCardProps {
  address: string;
  hours: string;
  operatingDays?: readonly OperatingDay[];
  phone: string;
  website: string;
  /** 전달하면 전화번호 행이 tel: 링크가 된다. 미전달 시 기존처럼 텍스트로만 표시. */
  phoneHref?: string;
  /** 전달하면 홈페이지 행이 외부 링크가 된다. http/https URL만 넘길 것. */
  websiteHref?: string;
}

function DetailInfoCard({
  address,
  hours,
  operatingDays = [],
  phone,
  website,
  phoneHref,
  websiteHref,
}: DetailInfoCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);
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

  const rows: ReadonlyArray<{
    key: string;
    icon: string;
    label: string;
    href?: string;
  }> = [
    { key: 'address', icon: locationPin, label: address },
    { key: 'hours', icon: schedule, label: hours },
    { key: 'phone', icon: call, label: phone, href: phoneHref },
    { key: 'website', icon: language, label: website, href: websiteHref },
  ];

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <div
        ref={innerRef}
        className="flex flex-col rounded-xl border border-gray-2 bg-white"
        style={{
          width: CARD_DESIGN_WIDTH,
          paddingLeft: CARD_PADDING_X,
          paddingRight: CARD_PADDING_X,
          paddingTop: CARD_PADDING_Y,
          paddingBottom: CARD_PADDING_Y,
          gap: ROW_GAP,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {rows.map((row) => (
          <div
            key={row.key}
            className={`flex ${
              row.key === 'hours' ? 'items-start' : 'items-center'
            }`}
            style={{ gap: ICON_TEXT_GAP }}
          >
            <img
              src={row.icon}
              alt=""
              aria-hidden="true"
              className="shrink-0"
              style={{
                width: ICON_SIZE,
                height: ICON_SIZE,
                marginTop: row.key === 'hours' ? (TEXT_LINE_HEIGHT - ICON_SIZE) / 2 : undefined,
              }}
            />

            {row.key === 'hours' && canExpandHours ? (
              <div>
                <button
                  type="button"
                  aria-expanded={isHoursOpen}
                  onClick={() => setIsHoursOpen((open) => !open)}
                  className="text-gray-5 flex items-center tabular-nums"
                  style={{ gap: 2, fontSize: TEXT_SIZE, lineHeight: `${TEXT_LINE_HEIGHT}px` }}
                >
                  <span>{displayedHours}</span>
                  <IoChevronDown
                    aria-hidden="true"
                    className={`transition-transform ${
                      isHoursOpen ? 'rotate-180' : ''
                    }`}
                    style={{ fontSize: HOURS_CHEVRON_SIZE }}
                  />
                </button>

                {isHoursOpen ? (
                  <ul
                    className="text-gray-5 tabular-nums"
                    style={{ marginTop: ROW_GAP, fontSize: TEXT_SIZE, lineHeight: `${TEXT_LINE_HEIGHT}px` }}
                  >
                    {remainingOperatingDays.map((day) => (
                      <li key={day.dayOfWeek}>{formatOperatingDay(day)}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : row.href ? (
              <a
                href={row.href}
                target={row.href.startsWith('tel:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="font-regular text-gray-5 underline"
                style={{ fontSize: TEXT_SIZE, lineHeight: `${TEXT_LINE_HEIGHT}px` }}
              >
                {row.label}
              </a>
            ) : (
              <span
                className="font-regular text-gray-5"
                style={{ fontSize: TEXT_SIZE, lineHeight: `${TEXT_LINE_HEIGHT}px` }}
              >
                {row.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DetailInfoCard;

