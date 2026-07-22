import heart from '../../assets/icons/heart.svg';

interface ContentCardSkeletonProps {
  className?: string;
  imageClassName?: string;
}

function ContentCardSkeleton({
  className = '',
  imageClassName = 'aspect-[163/115]',
}: ContentCardSkeletonProps) {
  return (
    <article
      className={`
        flex
        w-[41.79vw]
        shrink-0
        aspect-[163/222]
        flex-col
        overflow-hidden
        rounded-xl
        bg-[#F9F9F9]
        shadow-[0_1px_5px_rgba(0,0,0,0.07)]
        animate-pulse
        ${className}
      `}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-[8px]">
        <div className={`${imageClassName} w-full bg-[#EAEAEA]`} />

        <div className="absolute right-[2.05vw] top-[2.05vw]">
          <img
            src={heart}
            alt=""
            aria-hidden="true"
            className="h-[4.10vw] w-[4.10vw]"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col p-[2.05vw]">
        {/* Title */}
        <div className="h-[3.59vw] w-[22.56vw] rounded bg-[#EAEAEA]" />

        {/* Info */}
        <div className="mt-[2.05vw] flex flex-col gap-[1.03vw]">
          <div className="flex items-center gap-[1.03vw]">
            <div className="h-[3.59vw] w-[3.59vw] rounded-full bg-[#EAEAEA]" />
            <div className="h-[3.08vw] w-[18.46vw] rounded bg-[#EAEAEA]" />
          </div>

          <div className="flex items-center gap-[1.03vw]">
            <div className="h-[3.59vw] w-[3.59vw] rounded-full bg-[#EAEAEA]" />
            <div className="h-[3.08vw] w-[24.62vw] rounded bg-[#EAEAEA]" />
          </div>
        </div>

        {/* Tags */}
        <div className="mt-auto border-t border-[#E4E4E4] pt-[2.05vw]">
          <div className="flex gap-[1.03vw]">
            <div className="h-[5.13vw] w-[12.31vw] rounded-full bg-[#EAEAEA]" />
            <div className="h-[5.13vw] w-[14.36vw] rounded-full bg-[#EAEAEA]" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default ContentCardSkeleton;