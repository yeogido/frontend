import heart from '../../assets/icons/heart.svg';

interface ContentCardSkeletonProps {
  className?: string;
  imageClassName?: string;
}

function ContentCardSkeleton({
  className = '',
  imageClassName = 'h-[115px]',
}: ContentCardSkeletonProps) {
  return (
    <article
      className={`
        grow-0
        shrink
        basis-[163px]
        min-w-[140px]
        max-w-[163px]
        h-[222px]
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
      <div className="flex h-[107px] flex-col p-2">
        {/* Title */}
        <div className="h-[14px] w-[88px] rounded bg-[#EAEAEA]" />

        {/* Info */}
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="h-[14px] w-[14px] rounded-full bg-[#EAEAEA]" />
            <div className="h-[12px] w-[72px] rounded bg-[#EAEAEA]" />
          </div>

          <div className="flex items-center gap-1">
            <div className="h-[14px] w-[14px] rounded-full bg-[#EAEAEA]" />
            <div className="h-[12px] w-[96px] rounded bg-[#EAEAEA]" />
          </div>
        </div>

        {/* Tags */}
        <div className="mt-auto border-t border-[#E4E4E4] pt-2">
          <div className="flex gap-1">
            <div className="h-5 w-12 rounded-full bg-[#EAEAEA]" />
            <div className="h-5 w-14 rounded-full bg-[#EAEAEA]" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default ContentCardSkeleton;
