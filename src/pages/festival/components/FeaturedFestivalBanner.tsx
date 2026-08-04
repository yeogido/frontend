import calendar from '../../../assets/icons/calendar.svg';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import type { FeaturedFestival } from '../types';

const BANNER_HEIGHT = 129;
const BANNER_RADIUS = 12;
const TITLE_TOP = 24;
const TITLE_LEFT = 16;
const TITLE_WIDTH = 163;
const TITLE_SIZE = 16;
const DESCRIPTION_MARGIN_TOP = 10;
const DESCRIPTION_SIZE = 10;
const DESCRIPTION_LINE_HEIGHT = 12;
const META_BOTTOM = 14;
const META_LEFT = 16;
const META_GAP = 2;
const META_SIZE = 10;
const ICON_SIZE = 14;

interface FeaturedFestivalBannerProps {
  festival: FeaturedFestival;
  onClick?: () => void;
}

function FeaturedFestivalBanner({
  festival,
  onClick,
}: FeaturedFestivalBannerProps) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative block w-full overflow-hidden text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
      style={{
        height: BANNER_HEIGHT * scale,
        borderRadius: BANNER_RADIUS * scale,
      }}
    >
      <img
        src={festival.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />

      <div
        className="absolute text-white"
        style={{
          top: TITLE_TOP * scale,
          left: TITLE_LEFT * scale,
          width: TITLE_WIDTH * scale,
        }}
      >
        <p className="font-semibold" style={{ fontSize: TITLE_SIZE * scale }}>
          {festival.title}
        </p>
        <p
          className="line-clamp-2 font-medium"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          {festival.description}
        </p>
      </div>

      <div
        className="absolute flex items-center font-medium text-white"
        style={{
          bottom: META_BOTTOM * scale,
          left: META_LEFT * scale,
          gap: META_GAP * scale,
          fontSize: META_SIZE * scale,
        }}
      >
        <img
          src={calendar}
          alt=""
          aria-hidden="true"
          className="brightness-0 invert"
          style={{ width: ICON_SIZE * scale, height: ICON_SIZE * scale }}
        />
        <span>{festival.period}</span>
      </div>
    </button>
  );
}

export default FeaturedFestivalBanner;
