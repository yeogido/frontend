import heart from '../../assets/icons/heart.svg';

function CourseCardSkeleton() {
  return (
    <article
      className="
        relative
        flex
        h-[100px]
        w-[342px]
        shrink-0
        overflow-hidden
        rounded-xl
        bg-[#F9F9F9]
        shadow-[0_1px_5px_rgba(0,0,0,0.07)]
        animate-pulse
      "
    >
      {/* Image */}
      <div className="h-full w-[136px] rounded-l-xl bg-[#EAEAEA]" />

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between px-4 py-4">
        {/* Title & Description */}
        <div>
          <div className="h-[16px] w-[158px] rounded bg-[#EAEAEA]" />

          <div className="mt-1 h-[12px] w-[140px] rounded bg-[#EAEAEA]" />
        </div>

        {/* Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-[14px] w-[14px] rounded bg-[#EAEAEA]" />

            <div className="h-[12px] w-[48px] rounded bg-[#EAEAEA]" />
          </div>

          <div className="flex items-center gap-1">
            <div className="h-[14px] w-[14px] rounded bg-[#EAEAEA]" />

            <div className="h-[12px] w-[64px] rounded bg-[#EAEAEA]" />
          </div>
        </div>
      </div>

      {/* Like */}
      <div className="absolute right-3 top-3">
        <img
          src={heart}
          alt=""
          aria-hidden="true"
          className="h-5 w-5"
        />
      </div>
    </article>
  );
}

export default CourseCardSkeleton;