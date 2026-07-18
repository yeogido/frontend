import heart from '../../assets/icons/heart.svg';

function CourseCardSkeleton() {
  return (
    <article
      role="status"
      aria-label="코스 정보를 불러오는 중"
      className="
        relative
        flex
        min-h-[100px]
        w-full
        overflow-hidden
        rounded-xl
        bg-[#F9F9F9]
        shadow-[0_1px_5px_rgba(0,0,0,0.07)]
        animate-pulse
      "
    >
      {/* Image */}
      <div className="w-[136px] shrink-0 self-stretch rounded-[8px] bg-[#EAEAEA]" />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col px-4 py-4">
        {/* Title */}
        <div className="h-[16px] w-[150px] rounded bg-[#EAEAEA]" />

        {/* Meta */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-[2px]">
            <div className="h-[14px] w-[14px] rounded bg-[#EAEAEA]" />
            <div className="h-[12px] w-[36px] rounded bg-[#EAEAEA]" />
          </div>

          <div className="flex items-center gap-[2px]">
            <div className="h-[14px] w-[14px] rounded bg-[#EAEAEA]" />
            <div className="h-[12px] w-[36px] rounded bg-[#EAEAEA]" />
          </div>

          <div className="flex items-center gap-[2px]">
            <div className="h-[14px] w-[14px] rounded bg-[#EAEAEA]" />
            <div className="h-[12px] w-[36px] rounded bg-[#EAEAEA]" />
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-[24px] w-[48px] rounded-full bg-[#EAEAEA]" />
          <div className="h-[24px] w-[56px] rounded-full bg-[#EAEAEA]" />
          <div className="h-[24px] w-[44px] rounded-full bg-[#EAEAEA]" />
        </div>
      </div>

      {/* Like */}
      <div className="absolute right-3 top-3">
        <img
          src={heart}
          alt=""
          aria-hidden="true"
          className="h-5 w-5 opacity-30"
        />
      </div>
    </article>
  );
}

export default CourseCardSkeleton;