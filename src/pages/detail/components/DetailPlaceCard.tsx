import heart from '../../../assets/icons/heart.svg';
import oheart from '../../../assets/icons/oheart.svg';
import { useScaleFrame } from '../../../hooks/useScaleFrame';

const CARD_DESIGN_WIDTH = 342;
const CARD_HEIGHT = 97;
const CARD_PADDING = 12; // 추정값, 실측 필요
const THUMBNAIL_SIZE = 67; // 추정값, 실측 필요 (97 - 12*2)
const CONTENT_GAP = 12; // 추정값, 실측 필요
const TITLE_SIZE = 14;
const META_SIZE = 12;
const META_GAP = 2; // 추정값, 실측 필요
// relaxedSpacing일 때만 쓰는, 제목-주소-영업시간 사이 간격. 기본값(2px)이
// 거의 붙어 보여서(행사 상세 페이지 피드백) 그 자리에서만 더 넓게 쓴다.
const META_GAP_RELAXED = 8;
const HEART_SIZE = 20;

export interface DetailPlaceCardProps {
  imageUrl: string;
  title: string;
  address: string;
  hours: string;
  liked?: boolean;
  onClick?: () => void;
  onLikeClick?: () => void;
  /**
   * true면 제목-주소-영업시간 사이 간격을 넓히고, 그만큼 카드 높이도
   * 늘어나게 둔다(고정 높이 대신 최소 높이만 유지). 기본값은 false라
   * 다른 화면(소상공인 상세 등)은 기존 모습 그대로다.
   */
  relaxedSpacing?: boolean;
}

function DetailPlaceCard({
  imageUrl,
  title,
  address,
  hours,
  liked = false,
  onClick,
  onLikeClick,
  relaxedSpacing = false,
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
        className={`relative flex items-center rounded-xl bg-white ${
          isClickable ? 'cursor-pointer' : ''
        }`}
        style={{
          width: CARD_DESIGN_WIDTH,
          ...(relaxedSpacing
            ? { minHeight: CARD_HEIGHT }
            : { height: CARD_HEIGHT }),
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
          style={{ gap: relaxedSpacing ? META_GAP_RELAXED : META_GAP }}
        >
          <h3
            className="truncate leading-none font-semibold text-black"
            style={{ fontSize: TITLE_SIZE }}
          >
            {title}
          </h3>

          <p
            className="font-regular text-gray-4 truncate leading-none"
            style={{ fontSize: META_SIZE }}
          >
            {address}
          </p>

          <p
            className="font-regular text-gray-3 truncate"
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
