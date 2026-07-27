import { useGlobalScale } from '../../../hooks/useGlobalScale';
import type { CourseStop } from '../types/courseDetail';

// Figma 390 디자인 기준 리터럴 px
const GRID_COL_ORDER = 20;
const GRID_COL_IMAGE = 52;
const GRID_COL_ACTION = 22;
const ROW_GAP = 12;
const ROW_PADDING_Y = 8;
const ORDER_BADGE_SIZE = 20;
const ORDER_BADGE_FONT_SIZE = 11;
const ORDER_ICON_PADDING_TOP = 2;
const CONNECTOR_MARGIN_Y = 6;
const IMAGE_SIZE = 52;
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
  readonly onLikeToggle?: () => void;
}

export function CourseStopItem({
  stop,
  isLast,
  onLikeToggle,
}: CourseStopItemProps) {
  const scale = useGlobalScale();
  const [transportType, ...transportRest] = (stop.transportToNext ?? '').split(
    ' '
  );

  return (
    <article
      className="relative grid items-start"
      style={{
        gridTemplateColumns: `${GRID_COL_ORDER * scale}px ${GRID_COL_IMAGE * scale}px minmax(0,1fr) ${
          onLikeToggle
            ? GRID_COL_ACTION * scale
            : GRID_COL_ACTION * scale
        }px`,
        gap: ROW_GAP * scale,
        paddingTop: ROW_PADDING_Y * scale,
        paddingBottom: ROW_PADDING_Y * scale,
      }}
    >
      <div
        className="relative flex h-full flex-col items-center"
        style={{ paddingTop: ORDER_ICON_PADDING_TOP * scale }}
      >
        <span
          className="flex shrink-0 items-center justify-center rounded-full bg-[#FF5C38] leading-none font-bold text-white shadow-xs"
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
            className="w-0 flex-1 border-l border-dashed border-[#FF5C38]/60"
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
          className="truncate leading-tight font-bold text-[#1C1C1C]"
          style={{ fontSize: NAME_FONT_SIZE * scale }}
        >
          {stop.name}
        </h3>
        <p
          className="truncate font-normal text-[#888888]"
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
            className="truncate font-normal text-[#888888]"
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
            className="truncate font-normal text-[#888888]"
            style={{
              marginTop: TRANSPORT_MARGIN_TOP * scale,
              fontSize: META_FONT_SIZE * scale,
              lineHeight: `${META_LINE_HEIGHT * scale}px`,
            }}
          >
            <span className="font-semibold text-[#666666]">
              {transportType}
            </span>{' '}
            {transportRest.join(' ')}
          </p>
        )}
      </div>

      {onLikeToggle && (
        <button
          type="button"
          aria-label={`${stop.name} 좋아요 ${stop.liked ? '취소' : '추가'}`}
          aria-pressed={stop.liked}
          onClick={onLikeToggle}
          className={`flex items-center justify-center ${
            stop.liked ? 'text-[#FF5C38]' : 'text-gray-300'
          }`}
          style={{
            marginTop: LIKE_BUTTON_MARGIN_TOP * scale,
            height: LIKE_BUTTON_SIZE * scale,
            width: LIKE_BUTTON_SIZE * scale,
          }}
        >
          <svg
            className="fill-current"
            viewBox="0 0 24 24"
            style={{
              height: LIKE_ICON_SIZE * scale,
              width: LIKE_ICON_SIZE * scale,
            }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      )}
    </article>
  );
}

export default CourseStopItem;
