import type { MouseEvent as ReactMouseEvent } from 'react';
import { FaHeart as FilledHeartIcon } from 'react-icons/fa6';
import { isValidGeoPoint } from '../../../components/kakaomap/types';
import { openKakaoMapRoute } from '../../../components/kakaomap/utils/kakaoMapLink';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
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
const LIKE_BUTTON_MARGIN_TOP = 2;
const LIKE_BUTTON_SIZE = 24;
const LIKE_ICON_SIZE = 18;

export interface CourseStopItemProps {
  readonly stop: CourseStop;
  readonly isLast: boolean;
  readonly onLikeToggle: () => void;
  readonly isLikeAvailable?: boolean;
  readonly isLikePending?: boolean;
}

export function CourseStopItem({
  stop,
  isLast,
  onLikeToggle,
  isLikeAvailable = true,
  isLikePending = false,
}: CourseStopItemProps) {
  const scale = useGlobalScale();
  const [transportType, ...transportRest] = (stop.transportToNext ?? '').split(
    ' '
  );
  const isActive = stop.liked;
  const location = stop.location;
  const canRoute = isValidGeoPoint(location);

  const handleRoute = () => openKakaoMapRoute(stop.name, location);

  const handleLikeClick = (event: ReactMouseEvent) => {
    event.stopPropagation();
    onLikeToggle();
  };

  return (
    <article
      className={`relative grid items-start ${canRoute ? 'cursor-pointer' : ''}`}
      style={{
        gridTemplateColumns: `${GRID_COL_ORDER * scale}px ${GRID_COL_IMAGE * scale}px minmax(0,1fr) ${GRID_COL_ACTION * scale}px`,
        gap: ROW_GAP * scale,
        paddingTop: ROW_PADDING_Y * scale,
        paddingBottom: ROW_PADDING_Y * scale,
      }}
      onClick={canRoute ? handleRoute : undefined}
      role={canRoute ? 'button' : undefined}
      tabIndex={canRoute ? 0 : undefined}
      aria-label={canRoute ? `${stop.name} 카카오맵 길찾기` : undefined}
      onKeyDown={
        canRoute
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleRoute();
              }
            }
          : undefined
      }
    >
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
        {stop.hours && (
          <p
            className="text-gray-3 truncate font-sans"
            style={{
              fontSize: META_FONT_SIZE * scale,
              lineHeight: `${META_LINE_HEIGHT * scale}px`,
            }}
          >
            {stop.hours}
          </p>
        )}

        {stop.transportToNext && (
          <p
            className="text-gray-4 truncate font-sans"
            style={{
              marginTop: TRANSPORT_MARGIN_TOP * scale,
              fontSize: META_FONT_SIZE * scale,
              lineHeight: `${META_LINE_HEIGHT * scale}px`,
            }}
          >
            <span className="text-gray-4 font-semibold">{transportType}</span>{' '}
            {transportRest.join(' ')}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-label={`${stop.name} 좋아요 ${isActive ? '취소' : '추가'}`}
        aria-pressed={isActive}
        onClick={handleLikeClick}
        onKeyDown={(event) => event.stopPropagation()}
        disabled={!isLikeAvailable || isLikePending}
        className="flex items-center justify-center drop-shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
