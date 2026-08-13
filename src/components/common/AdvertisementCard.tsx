import { useScaleFrame } from '../../hooks/useScaleFrame';

// Figma 390 디자인 기준 리터럴 px (카드 자체 폭 342 기준)
const CARD_DESIGN_WIDTH = 342;
const CARD_HEIGHT = 120;
const CARD_RADIUS = 12;

const TEXT_LEFT = 16;
const TEXT_TOP = 56;
const TITLE_LINE_HEIGHT = 22;

export interface AdvertisementCardProps {
  image: string;
  titleWhite: string;
  titleOrangeBold: string;
  titleOrangeRegular: string;
  onClick?: () => void;
}

function AdvertisementCard({
  image,
  titleWhite,
  titleOrangeBold,
  titleOrangeRegular,
  onClick,
}: AdvertisementCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  const isClickable = Boolean(onClick);

  return (
    <div
      ref={outerRef}
      className="w-full shrink-0 overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <div
        ref={innerRef}
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className={`relative overflow-hidden bg-[#EAEAEA] ${
          isClickable ? 'cursor-pointer' : ''
        }`}
        style={{
          width: CARD_DESIGN_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: CARD_RADIUS,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {image && (
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* 텍스트 가독성을 위한 하단 그라데이션 오버레이 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* Title */}
        <div
          className="absolute flex flex-col"
          style={{ left: TEXT_LEFT, top: TEXT_TOP }}
        >
          <span
            className="font-medium text-white"
            style={{
              fontSize: 18,
              lineHeight: `${TITLE_LINE_HEIGHT}px`,
            }}
          >
            {titleWhite}
          </span>

          <span style={{ lineHeight: `${TITLE_LINE_HEIGHT}px` }}>
            <span
              className="font-semibold"
              style={{ fontSize: 18, color: '#FF6F41' }}
            >
              {titleOrangeBold}
            </span>

            <span
              className="font-medium"
              style={{ fontSize: 18, color: '#F9F9F9' }}
            >
              {titleOrangeRegular}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default AdvertisementCard;