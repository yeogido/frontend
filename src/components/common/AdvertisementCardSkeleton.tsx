import { useScaleFrame } from '../../hooks/useScaleFrame';

const CARD_DESIGN_WIDTH = 342;
const CARD_HEIGHT = 120;
const CARD_RADIUS = 12;

function AdvertisementCardSkeleton() {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  return (
    <div
      ref={outerRef}
      role="status"
      aria-label="광고를 불러오는 중"
      className="w-full shrink-0 overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <div
        ref={innerRef}
        className="animate-pulse bg-[#EAEAEA]"
        style={{
          width: CARD_DESIGN_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: CARD_RADIUS,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}

export default AdvertisementCardSkeleton;