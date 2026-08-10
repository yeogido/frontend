import { useState, type MouseEvent as ReactMouseEvent } from 'react';
import { FaHeart as FilledHeartIcon } from 'react-icons/fa6';
import { IoChevronDown } from 'react-icons/io5';
import carIcon from '../../../assets/icons/transport-car.svg';
import transitIcon from '../../../assets/icons/transport-transit.svg';
import operatingStatusClockIcon from '../../../assets/icons/operating-status-clock.svg';
import { isValidGeoPoint } from '../../../components/kakaomap/types';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import {
  formatOperatingDay,
  formatTodayOperatingHours,
  isOperatingNow,
} from '../../../utils/operatingHours';
import type { CourseStop } from '../types/courseDetail';

// Figma 390 디자인 기준 리터럴 px
const GRID_COL_ORDER = 20;
const GRID_COL_IMAGE = 65;
const GRID_COL_ACTION = 22;
const ROW_GAP = 12;
const ROW_PADDING_Y = 10;
const ORDER_BADGE_SIZE = 18;
const ORDER_BADGE_FONT_SIZE = 11;
const ORDER_ICON_PADDING_TOP = 2;
const CONNECTOR_MARGIN_Y = 6;
const IMAGE_SIZE = 65;
const IMAGE_RADIUS = 10;
const CONTENT_PADDING_TOP = 2;
const NAME_FONT_SIZE = 14;
const META_MARGIN_TOP = 2;
const META_FONT_SIZE = 11;
const META_LINE_HEIGHT = 16;
const TRANSPORT_MARGIN_TOP = 4;
const TRANSPORT_GAP = 10;
const TRANSPORT_ICON_GAP = 4;
const TRANSPORT_ICON_SIZE = 12;
const HOURS_STATUS_ICON_SIZE = 12;
const HOURS_STATUS_ICON_GAP = 5;
const HOURS_STATUS_TO_CHEVRON_GAP = 6;
const HOURS_CHEVRON_SIZE = 10;
const HOURS_LIST_MARGIN_TOP = 2;
const LIKE_BUTTON_MARGIN_TOP = 2;
const LIKE_BUTTON_SIZE = 24;
const LIKE_ICON_SIZE = 18;
const OPEN_STATUS_LABEL = '영업 중';
const CLOSED_STATUS_LABEL = '영업 종료';

export interface CourseStopItemProps {
  readonly stop: CourseStop;
  readonly isLast: boolean;
  readonly onLikeToggle: () => void;
  readonly onFocus?: () => void;
  readonly isLikeAvailable?: boolean;
  readonly isLikePending?: boolean;
  /** 있으면 영업시간이 드롭다운(영업중/영업종료 + 요일별 시간)으로 표시된다. */
  /** 바로 이전 코스 아이템과의 이동 소요시간. 첫 번째 아이템은 비교 대상이 없어 항상 undefined다. */
}

export function CourseStopItem({
  stop,
  isLast,
  onLikeToggle,
  onFocus,
  isLikeAvailable = true,
  isLikePending = false,
}: CourseStopItemProps) {
  const scale = useGlobalScale();
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const operatingDays = stop.operatingDays ?? [];
  const canExpandHours = operatingDays.length > 0;
  // 요일별 영업시간을 파싱할 수 있으면 현재 요일·시각 기준으로 직접 계산하고,
  // 파싱할 수 없는 경우(휴무 표기만 있거나 형식이 다른 경우)에만 구글이
  // 내려준 openNow 값으로 대체한다.
  const isOpenNow = isOperatingNow(operatingDays);
  const hoursStatusLabel =
    isOpenNow === undefined
      ? undefined
      : isOpenNow
        ? OPEN_STATUS_LABEL
        : CLOSED_STATUS_LABEL;
  const todayHours = formatTodayOperatingHours(operatingDays);
  const carDurationMinutes = stop.timesFromPrevious.find(
    (time) => time.transportMode === 'CAR'
  )?.durationMinutes;
  const transitDurationMinutes = stop.timesFromPrevious.find(
    (time) => time.transportMode === 'PUBLIC'
  )?.durationMinutes;
  const isActive = stop.liked;
  const location = stop.location;
  const canFocus = isValidGeoPoint(location) && !!onFocus;

  const handleLikeClick = (event: ReactMouseEvent) => {
    event.stopPropagation();
    onLikeToggle();
  };

  return (
    <article
      className="relative grid items-start"
      style={{
        gridTemplateColumns: `${GRID_COL_ORDER * scale}px ${GRID_COL_IMAGE * scale}px minmax(0,1fr) ${GRID_COL_ACTION * scale}px`,
        gap: ROW_GAP * scale,
        paddingTop: ROW_PADDING_Y * scale,
        paddingBottom: ROW_PADDING_Y * scale,
      }}
    >
      {canFocus && (
        <button
          type="button"
          onClick={onFocus}
          aria-label={`${stop.name} 지도에서 보기`}
          className="absolute inset-0 cursor-pointer"
        />
      )}

      <div
        className="relative flex h-full flex-col items-center"
        style={{ paddingTop: ORDER_ICON_PADDING_TOP * scale }}
      >
        <span
          className="bg-main-5 flex shrink-0 items-center justify-center rounded-full leading-none font-bold text-white"
          style={{
            height: ORDER_BADGE_SIZE * scale,
            width: ORDER_BADGE_SIZE * scale,
            fontSize: ORDER_BADGE_FONT_SIZE * scale,
          }}
        >
          {stop.order}
        </span>

        {!isLast && (
          <span
            className="border-main-5/60 w-0 flex-1 border-l border-dashed"
            style={{
              marginTop: CONNECTOR_MARGIN_Y * scale,
              marginBottom: CONNECTOR_MARGIN_Y * scale,
            }}
          />
        )}
      </div>

      <img
        src={stop.image}
        alt={stop.name}
        className="object-cover"
        style={{
          height: IMAGE_SIZE * scale,
          width: IMAGE_SIZE * scale,
          borderRadius: IMAGE_RADIUS * scale,
        }}
      />

      <div
        className="min-w-0"
        style={{ paddingTop: CONTENT_PADDING_TOP * scale }}
      >
        <h3
          className="truncate leading-tight font-bold"
          style={{ fontSize: NAME_FONT_SIZE * scale }}
        >
          {stop.name}
        </h3>
        <p
          className="text-gray-4 truncate font-normal"
          style={{
            marginTop: META_MARGIN_TOP * scale,
            fontSize: META_FONT_SIZE * scale,
            lineHeight: `${META_LINE_HEIGHT * scale}px`,
          }}
        >
          {stop.address}
        </p>
        {(todayHours || stop.placeId !== undefined) &&
          (canExpandHours ? (
            <div className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsHoursOpen((open) => !open);
                }}
                onKeyDown={(event) => event.stopPropagation()}
                aria-expanded={isHoursOpen}
                className="text-gray-3 flex max-w-full items-center"
                style={{ gap: HOURS_STATUS_TO_CHEVRON_GAP * scale }}
              >
                <span
                  className="flex min-w-0 items-center"
                  style={{ gap: HOURS_STATUS_ICON_GAP * scale }}
                >
                  {isHoursOpen && hoursStatusLabel ? (
                    <img
                      src={operatingStatusClockIcon}
                      alt=""
                      aria-hidden="true"
                      style={{
                        width: HOURS_STATUS_ICON_SIZE * scale,
                        height: HOURS_STATUS_ICON_SIZE * scale,
                      }}
                    />
                  ) : null}
                  <span
                    className="truncate font-sans"
                    style={{
                      fontSize: META_FONT_SIZE * scale,
                      lineHeight: `${META_LINE_HEIGHT * scale}px`,
                    }}
                  >
                    {isHoursOpen && hoursStatusLabel
                      ? hoursStatusLabel
                      : (todayHours ?? '영업시간 정보 없음')}
                  </span>
                </span>
                <IoChevronDown
                  aria-hidden="true"
                  className={`shrink-0 transition-transform ${isHoursOpen ? 'rotate-180' : ''}`}
                  style={{ fontSize: HOURS_CHEVRON_SIZE * scale }}
                />
              </button>

              {isHoursOpen && (
                <ul style={{ marginTop: HOURS_LIST_MARGIN_TOP * scale }}>
                  {operatingDays.map((operatingDay) => (
                    <li
                      key={operatingDay.dayOfWeek}
                      className="text-gray-3 font-sans"
                      style={{
                        fontSize: META_FONT_SIZE * scale,
                        lineHeight: `${META_LINE_HEIGHT * scale}px`,
                      }}
                    >
                      {formatOperatingDay(operatingDay)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p
              className="text-gray-3 truncate font-sans"
              style={{
                fontSize: META_FONT_SIZE * scale,
                lineHeight: `${META_LINE_HEIGHT * scale}px`,
              }}
            >
              {todayHours ?? '영업시간 정보 없음'}
            </p>
          ))}

        {(carDurationMinutes !== undefined ||
          transitDurationMinutes !== undefined) && (
          <div
            className="text-gray-4 flex items-center"
            style={{
              marginTop: TRANSPORT_MARGIN_TOP * scale,
              gap: TRANSPORT_GAP * scale,
            }}
          >
            {carDurationMinutes !== undefined && (
              <span
                className="flex items-center"
                style={{ gap: TRANSPORT_ICON_GAP * scale }}
              >
                <img
                  src={carIcon}
                  alt="자동차"
                  style={{
                    width: TRANSPORT_ICON_SIZE * scale,
                    height: TRANSPORT_ICON_SIZE * scale,
                  }}
                />
                <span
                  className="font-sans"
                  style={{
                    fontSize: META_FONT_SIZE * scale,
                    lineHeight: `${META_LINE_HEIGHT * scale}px`,
                  }}
                >
                  {carDurationMinutes}분
                </span>
              </span>
            )}
            {transitDurationMinutes !== undefined && (
              <span
                className="flex items-center"
                style={{ gap: TRANSPORT_ICON_GAP * scale }}
              >
                <img
                  src={transitIcon}
                  alt="대중교통"
                  style={{
                    width: TRANSPORT_ICON_SIZE * scale,
                    height: TRANSPORT_ICON_SIZE * scale,
                  }}
                />
                <span
                  className="font-sans"
                  style={{
                    fontSize: META_FONT_SIZE * scale,
                    lineHeight: `${META_LINE_HEIGHT * scale}px`,
                  }}
                >
                  {transitDurationMinutes}분
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label={`${stop.name} 좋아요 ${isActive ? '취소' : '추가'}`}
        aria-pressed={isActive}
        onClick={handleLikeClick}
        onKeyDown={(event) => event.stopPropagation()}
        disabled={!isLikeAvailable || isLikePending}
        className="relative flex items-center justify-center drop-shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          marginTop: LIKE_BUTTON_MARGIN_TOP * scale,
          height: LIKE_BUTTON_SIZE * scale,
          width: LIKE_BUTTON_SIZE * scale,
        }}
      >
        <FilledHeartIcon
          className={`fill-current ${isActive ? 'text-main-5' : 'text-gray-2'}`}
          style={{
            height: LIKE_ICON_SIZE * scale,
            width: LIKE_ICON_SIZE * scale,
          }}
        />
      </button>
    </article>
  );
}

export default CourseStopItem;
