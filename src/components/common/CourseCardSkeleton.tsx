import heart from '../../assets/icons/heart.svg';

function CourseCardSkeleton() {
  return (
    <article
      role="status"
      aria-label="코스 정보를 불러오는 중"
      className="
        relative
        flex
        w-full
        aspect-[342/100]
        overflow-hidden
        rounded-xl
        bg-[#F9F9F9]
        shadow-[0_1px_5px_rgba(0,0,0,0.07)]
        animate-pulse
      "
    >
      {/* Image */}
      <div className="aspect-[136/100] h-full shrink-0 rounded-[8px] bg-[#EAEAEA]" />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col px-[4.10vw] py-[4.10vw]">
        {/* Title */}
        <div className="h-[4.10vw] w-[38.46vw] rounded bg-[#EAEAEA]" />

        {/* Meta */}
        <div className="mt-[2.05vw] flex items-center gap-[2.05vw]">
          <div className="flex items-center gap-[0.51vw]">
            <div className="h-[3.59vw] w-[3.59vw] rounded bg-[#EAEAEA]" />
            <div className="h-[3.08vw] w-[9.23vw] rounded bg-[#EAEAEA]" />
          </div>

          <div className="flex items-center gap-[0.51vw]">
            <div className="h-[3.59vw] w-[3.59vw] rounded bg-[#EAEAEA]" />
            <div className="h-[3.08vw] w-[9.23vw] rounded bg-[#EAEAEA]" />
          </div>

          <div className="flex items-center gap-[0.51vw]">
            <div className="h-[3.59vw] w-[3.59vw] rounded bg-[#EAEAEA]" />
            <div className="h-[3.08vw] w-[9.23vw] rounded bg-[#EAEAEA]" />
          </div>
        </div>

        {/* Tags */}
        <div className="mt-[3.08vw] flex items-center gap-[2.05vw]">
          <div className="h-[6.15vw] w-[12.31vw] rounded-full bg-[#EAEAEA]" />
          <div className="h-[6.15vw] w-[14.36vw] rounded-full bg-[#EAEAEA]" />
          <div className="h-[6.15vw] w-[11.28vw] rounded-full bg-[#EAEAEA]" />
        </div>
      </div>

      {/* Like */}
      <div className="absolute right-[3.08vw] top-[3.08vw]">
        <img
          src={heart}
          alt=""
          aria-hidden="true"
          className="h-[5.13vw] w-[5.13vw] opacity-30"
        />
      </div>
    </article>
  );
}

export default CourseCardSkeleton;