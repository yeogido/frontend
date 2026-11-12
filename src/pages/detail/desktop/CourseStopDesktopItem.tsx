import { useState } from 'react';
import { FaHeart } from 'react-icons/fa6';
import { IoChevronDown } from 'react-icons/io5';

import carIcon from '../../../assets/icons/transport-car.svg';
import transitIcon from '../../../assets/icons/transport-transit.svg';
import operatingStatusClockIcon from '../../../assets/icons/operating-status-clock.svg';
import { isValidGeoPoint } from '../../../components/kakaomap/types';
import { getCourseTransportInfo } from '../../../utils/courseDetail';
import {
  formatOperatingDay,
  formatTodayOperatingHours,
  isOperatingNow,
  isTwentyFourHoursEveryDay,
} from '../../../utils/operatingHours';
import type { CourseStop } from '../types/courseDetail';

// Figma 1440 데스크톱 시안(6356:38115 일정 행) 기준 리터럴 px
const BADGE_SIZE = 24;
const THUMB_SIZE = 80;
const LIKE_SIZE = 24;
const OPEN_STATUS_LABEL = '영업 중';
const CLOSED_STATUS_LABEL = '영업 종료';

export interface CourseStopDesktopItemProps {
  readonly stop: CourseStop;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly onLikeToggle: () => void;
  readonly onFocus?: () => void;
  readonly isLikeAvailable: boolean;
  readonly isLikePending: boolean;
}

/**
 * 코스 상세의 일정 한 줄. 모바일 CourseStopItem과 보여주는 정보(영업시간,
 * 이동시간, 좋아요, 지도 포커스)는 같고 시안 치수만 다르다. 비율이 요소마다
 * 달라서(썸네일은 1.2배, 글자는 1.4배 이상) scale 하나로는 맞지 않아 따로 둔다.
 */
function CourseStopDesktopItem({
  stop,
  isFirst,
  isLast,
  onLikeToggle,
  onFocus,
  isLikeAvailable,
  isLikePending,
}: CourseStopDesktopItemProps) {
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const operatingDays = stop.operatingDays ?? [];
  const canExpandHours =
    operatingDays.length > 0 && !isTwentyFourHoursEveryDay(operatingDays);
  // 요일별 영업시간을 파싱할 수 있으면 현재 요일과 시각 기준으로 직접
  // 계산하고, 파싱할 수 없을 때만 undefined로 둔다.
  const isOpenNow = isOperatingNow(operatingDays);
  const hoursStatusLabel =
    isOpenNow === undefined
      ? undefined
      : isOpenNow
        ? OPEN_STATUS_LABEL
        : CLOSED_STATUS_LABEL;
  const todayHours = formatTodayOperatingHours(operatingDays);
  const defaultHoursText =
    todayHours ?? (canExpandHours ? '정기휴무' : '영업시간 정보 없음');
  const transportInfo = isFirst
    ? []
    : getCourseTransportInfo(stop.timesFromPrevious);
  const canFocus = isValidGeoPoint(stop.location) && !!onFocus;

  return (
    <article className="relative flex items-start justify-between">
      {canFocus ? (
        <button
          type="button"
          onClick={onFocus}
          aria-label={stop.name + ' 지도에서 보기'}
          className="absolute inset-0 cursor-pointer"
        />
      ) : null}

      <div className="flex items-stretch gap-[24px]">
        <div
          className="relative flex shrink-0 flex-col items-center"
          style={{ width: BADGE_SIZE }}
        >
          <span
            className="bg-main-5 flex shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white"
            style={{ height: BADGE_SIZE, width: BADGE_SIZE }}
          >
            {stop.order}
          </span>
          {!isLast ? (
            <span className="border-main-5/60 mt-[4px] w-0 flex-1 border-l border-dashed" />
          ) : null}
        </div>

        <div className="flex items-start gap-[20px]">
          <img
            src={stop.image}
            alt={stop.name}
            className="shrink-0 rounded-[12px] object-cover"
            style={{ height: THUMB_SIZE, width: THUMB_SIZE }}
          />

          <div className="flex min-w-0 flex-col gap-[8px]">
            <div className="flex flex-col gap-[6px]">
              <h3 className="text-[20px] font-semibold text-black">
                {stop.name}
              </h3>
              <p className="text-gray-4 text-[18px]">{stop.address}</p>
            </div>

            {canExpandHours ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsHoursOpen((open) => !open);
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                  aria-expanded={isHoursOpen}
                  className="text-gray-3 flex items-center gap-[6px] text-[18px]"
                >
                  {isHoursOpen && hoursStatusLabel ? (
                    <img
                      src={operatingStatusClockIcon}
                      alt=""
                      aria-hidden="true"
                      className="size-[16px]"
                    />
                  ) : null}
                  <span>
                    {isHoursOpen && hoursStatusLabel
                      ? hoursStatusLabel
                      : defaultHoursText}
                  </span>
                  <IoChevronDown
                    aria-hidden="true"
                    className={
                      'shrink-0 text-[16px] transition-transform ' +
                      (isHoursOpen ? 'rotate-180' : '')
                    }
                  />
                </button>

                {isHoursOpen ? (
                  <ul className="mt-[4px]">
                    {operatingDays.map((operatingDay) => (
                      <li
                        key={operatingDay.dayOfWeek}
                        className="text-gray-3 text-[18px]"
                      >
                        {formatOperatingDay(operatingDay)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <p className="text-gray-3 text-[18px]">{defaultHoursText}</p>
            )}

            {transportInfo.length > 0 ? (
              <div className="text-gray-4 flex flex-wrap items-center gap-[6px] text-[16px]">
                {transportInfo.map((time, index) => (
                  <span
                    key={time.transportMode}
                    className="flex items-center gap-[6px] whitespace-nowrap"
                  >
                    {index > 0 ? <span aria-hidden="true">·</span> : null}
                    {time.transportMode !== 'WALK' ? (
                      <img
                        src={
                          time.transportMode === 'CAR' ? carIcon : transitIcon
                        }
                        alt=""
                        aria-hidden="true"
                        className="size-[16px]"
                      />
                    ) : null}
                    <span>
                      {time.label} {time.durationMinutes}분
                    </span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={stop.name + ' 좋아요 ' + (stop.liked ? '취소' : '추가')}
        aria-pressed={stop.liked}
        onClick={(event) => {
          event.stopPropagation();
          onLikeToggle();
        }}
        onKeyDown={(event) => event.stopPropagation()}
        disabled={!isLikeAvailable || isLikePending}
        className="relative flex shrink-0 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
        style={{ height: LIKE_SIZE, width: LIKE_SIZE }}
      >
        <FaHeart
          className={
            'fill-current text-[22px] ' +
            (stop.liked ? 'text-main-5' : 'text-gray-2')
          }
        />
      </button>
    </article>
  );
}

export default CourseStopDesktopItem;
