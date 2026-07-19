import calendar from '../../../assets/icons/calendar.svg';
import type { FeaturedFestival } from '../types';

interface FeaturedFestivalBannerProps {
  festival: FeaturedFestival;
  onClick?: () => void;
}

function FeaturedFestivalBanner({
  festival,
  onClick,
}: FeaturedFestivalBannerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative block h-[129px] w-full overflow-hidden rounded-xl text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
    >
      <img
        src={festival.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute top-6 left-4 w-[163px] text-white">
        <p className="text-[16px] leading-none font-semibold">
          {festival.title}
        </p>
        <p className="mt-2.5 line-clamp-2 text-[10px] leading-3 font-medium">
          {festival.description}
        </p>
      </div>

      <div className="absolute bottom-3.5 left-4 flex items-center gap-0.5 text-[10px] leading-none font-medium text-white">
        <img
          src={calendar}
          alt=""
          aria-hidden="true"
          className="h-3.5 w-3.5 brightness-0 invert"
        />
        <span>{festival.period}</span>
      </div>
    </button>
  );
}

export default FeaturedFestivalBanner;
