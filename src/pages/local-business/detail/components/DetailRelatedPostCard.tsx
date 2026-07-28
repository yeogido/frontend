import heart from '../../../../assets/icons/heart.svg';
import { useScaleFrame } from '../../../../hooks/useScaleFrame';

const CARD_DESIGN_WIDTH = 342;
const CARD_HEIGHT = 97;
const CARD_PADDING = 12; // 추정값, 실측 필요
const THUMBNAIL_SIZE = 67; // 추정값, 실측 필요 (97 - 12*2)
const CONTENT_GAP = 12; // 추정값, 실측 필요
const TITLE_SIZE = 14;
const META_SIZE = 12;
const META_GAP = 2; // 추정값, 실측 필요
const HEART_SIZE = 20;

interface DetailRelatedPostCardProps {
  imageUrl: string;
  title: string;
  address: string;
  hours: string;
  liked?: boolean;
  onClick?: () => void;
  onLikeClick?: () => void;
}

function DetailRelatedPostCard({
  imageUrl,
  title,
  address,
  hours,
  liked = false,
  onClick,
  onLikeClick,
}: DetailRelatedPostCardProps) {
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
        className={`relative flex items-center rounded-xl bg-white ${
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
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="shrink-0 rounded-lg object-cover"
          style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
        />

        <div
          className="flex min-w-0 flex-1 flex-col"
          style={{ gap: META_GAP }}
        >
          <h3
            className="truncate leading-none font-semibold text-black"
            style={{ fontSize: TITLE_SIZE }}
          >
            {title}
          </h3>

          <p
            className="truncate leading-none font-regular text-gray-4"
            style={{ fontSize: META_SIZE }}
          >
            {address}
          </p>

          <p
            className="truncate font-regular text-gray-3"
            style={{ fontSize: META_SIZE }}
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
            src={heart}
            alt="좋아요"
            style={{ width: HEART_SIZE, height: HEART_SIZE }}
          />
        </button>
      </div>
    </div>
  );
}

export default DetailRelatedPostCard;
