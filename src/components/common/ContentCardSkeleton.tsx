import heart from '../../assets/icons/heart.svg';

function ContentCardSkeleton() {
  return (
    <article
      className="
        w-[163px]
        shrink-0
        overflow-hidden
        rounded-xl
        bg-[#F9F9F9]
        shadow-[0_1px_5px_rgba(0,0,0,0.07)]
        animate-pulse
      "
    >
      {/* Image */}
      <div className="relative">
        <div className="h-[115px] w-full rounded-t-xl bg-[#EAEAEA]" />

        {/* Like Icon */}
        <div className="absolute right-2 top-2">
          <img
            src={heart}
            alt=""
            aria-hidden="true"
            className="h-4 w-4"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-2">
        {/* Title */}
        <div className="h-[14px] w-[88px] rounded bg-[#EAEAEA]" />

        <div className="mt-2 flex flex-col gap-1">
          {/* First Info */}
          <div className="flex items-center gap-1">
            <div className="h-[14px] w-[14px] rounded-full bg-[#EAEAEA]" />
            <div className="h-[12px] w-[72px] rounded bg-[#EAEAEA]" />
          </div>

          {/* Second Info */}
          <div className="flex items-center gap-1">
            <div className="h-[14px] w-[14px] rounded-full bg-[#EAEAEA]" />
            <div className="h-[12px] w-[96px] rounded bg-[#EAEAEA]" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default ContentCardSkeleton;