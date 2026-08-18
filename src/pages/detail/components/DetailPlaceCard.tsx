import heart from '../../../assets/icons/heart.svg';
import locationOn from '../../../assets/icons/location-on.svg';
import oheart from '../../../assets/icons/oheart.svg';
import { useScaleFrame } from '../../../hooks/useScaleFrame';

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

export interface DetailPlaceCardProps {
  title: string;
  address: string;
  hours: string;
  liked?: boolean;
  onClick?: () => void;
  onLikeClick?: () => void;
}

function DetailPlaceCard({
  title,
  address,
  hours,
  liked = false,
  onClick,
  onLikeClick,
}: DetailPlaceCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  const isClickable = Boolean(onClick);

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
          height: CARD_HEIGHT,
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

          <p
            className="font-regular text-gray-3 truncate"
            style={{
              fontSize: META_SIZE,
              lineHeight: `${META_LINE_HEIGHT}px`,
            }}
          >
            {hours}
          </p>
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
