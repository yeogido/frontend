import { IoAdd, IoClose } from 'react-icons/io5';
import type { ReactNode } from 'react';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import PlaceMarkerIcon from './PlaceMarkerIcon';

// Figma 390 디자인 기준 리터럴 px
const ADD_GAP = 24;
const ADD_MARKER_GAP = 12;
const ADD_MARKER_LEFT_INSET = 4;
const REMOVE_GAP = 12;
const REMOVE_CARD_HEIGHT = 72;
const REMOVE_CARD_PADDING = 8;
const ADD_IMAGE_SIZE = 68;
const ADD_MARKER_WIDTH = 16;
const ADD_MARKER_HEIGHT = 20;
const REMOVE_IMAGE_SIZE = 56;
const TITLE_FONT_SIZE = 15;
const TITLE_LINE_HEIGHT = 20;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_FONT_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 20;
const ACTION_BUTTON_SIZE = 24;
const ACTION_ICON_SIZE = 16;
const CARD_RADIUS = 12;
const ACTION_RADIUS = 6;

interface SelectionResultCardProps<T> {
  item: T;
  title: string;
  description: string;
  imageSrc: string | null;
  imageAlt: string;
  imageFallback?: ReactNode;
  /** 'photo' (default): image thumbnail box. 'marker': plain location-pin icon, no photo box. Applies to both add and remove cards. */
  visual?: 'photo' | 'marker';
  action: 'add' | 'remove';
  disabled?: boolean;
  onItemAdd?: (item: T) => void;
  onItemRemove?: (item: T) => void;
}

function SelectionResultCard<T>({
  item,
  title,
  description,
  imageSrc,
  imageAlt,
  imageFallback,
  visual = 'photo',
  action,
  disabled = false,
  onItemAdd,
  onItemRemove,
}: SelectionResultCardProps<T>) {
  const scale = useGlobalScale();
  const isAddAction = action === 'add';
  const isMarker = visual === 'marker';
  const onAction = isAddAction ? onItemAdd : onItemRemove;
  const cardHeight = REMOVE_CARD_HEIGHT * scale;
  const cardPadding = REMOVE_CARD_PADDING * scale;
  const imageSize = (isAddAction ? ADD_IMAGE_SIZE : REMOVE_IMAGE_SIZE) * scale;
  const actionButtonSize = ACTION_BUTTON_SIZE * scale;
  const actionVisualSize = ACTION_BUTTON_SIZE * scale;
  const actionOverlap = (actionButtonSize - actionVisualSize) / -2;
  const titleSize = TITLE_FONT_SIZE * scale;
  const descriptionSize = DESCRIPTION_FONT_SIZE * scale;

  return (
    <article
      className={`flex min-w-0 items-center ${
        isAddAction ? '' : 'w-full bg-white'
      }`}
      style={{
        height: isAddAction ? undefined : cardHeight,
        gap:
          (isAddAction ? (isMarker ? ADD_MARKER_GAP : ADD_GAP) : REMOVE_GAP) *
          scale,
        padding: isAddAction ? undefined : cardPadding,
        borderRadius: CARD_RADIUS * scale,
      }}
    >
      {isMarker ? (
        <PlaceMarkerIcon
          aria-hidden="true"
          className={`shrink-0 ${isAddAction ? 'self-start' : ''}`}
          style={{
            width: ADD_MARKER_WIDTH * scale,
            height: ADD_MARKER_HEIGHT * scale,
            marginLeft: isAddAction ? ADD_MARKER_LEFT_INSET * scale : undefined,
          }}
        />
      ) : (
        <div
          className="bg-gray-2 flex shrink-0 items-center justify-center overflow-hidden"
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: CARD_RADIUS * scale,
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover"
            />
          ) : (
            imageFallback
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3
          className="truncate font-semibold text-black"
          style={{
            fontSize: titleSize,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          {title}
        </h3>
        <p
          className="text-gray-5 truncate"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: descriptionSize,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          {description}
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onAction?.(item)}
        aria-label={`${title} ${isAddAction ? '추가' : '삭제'}`}
        className="text-gray-3 flex shrink-0 items-center justify-center disabled:cursor-default disabled:opacity-40"
        style={{
          width: actionButtonSize,
          height: actionButtonSize,
          marginLeft: actionOverlap,
          marginRight: actionOverlap,
        }}
      >
        <span
          className="border-gray-2 flex items-center justify-center border bg-white"
          style={{
            width: actionVisualSize,
            height: actionVisualSize,
            borderRadius: ACTION_RADIUS * scale,
          }}
        >
          {isAddAction ? (
            <IoAdd
              aria-hidden="true"
              style={{ fontSize: ACTION_ICON_SIZE * scale }}
            />
          ) : (
            <IoClose
              aria-hidden="true"
              style={{ fontSize: ACTION_ICON_SIZE * scale }}
            />
          )}
        </span>
      </button>
    </article>
  );
}

export default SelectionResultCard;
