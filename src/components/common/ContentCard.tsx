import calendar from '../../assets/icons/calendar.svg';
import heart from '../../assets/icons/heart.svg';
import location from '../../assets/icons/location.svg';
import oheart from '../../assets/icons/oheart.svg';

interface ContentCardProps {
  image: string;
  title: string;
  firstInfo: string;
  secondInfo: string;
  liked?: boolean;
  className?: string;
  imageClassName?: string;
  onClick?: () => void;
  onLikeClick?: () => void;
}

function ContentCard({
  image,
  title,
  firstInfo,
  secondInfo,
  liked = false,
  className = '',
  imageClassName = 'h-[115px]',
  onClick,
  onLikeClick,
}: ContentCardProps) {
  return (
    <article
      onClick={onClick}
      className={`
        w-[163px]
        overflow-hidden
        rounded-xl
        bg-[#F9F9F9]
        shadow-[0_1px_5px_rgba(0,0,0,0.07)]
        cursor-pointer
        shrink-0
        ${className}
      `}
    >
      {/* Image */}
      <div className="relative">
        {image ? (
          <img
            src={image}
            alt={title}
            className={`${imageClassName} w-full rounded-t-xl object-cover`}
          />
        ) : (
          <div className={`${imageClassName} w-full rounded-t-xl bg-[#EAEAEA]`} />
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLikeClick?.();
          }}
          className="absolute right-2 top-2"
        >
          <img
            src={liked ? oheart : heart}
            alt="좋아요"
            className="h-4 w-4"
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-2">
        <h3 className="text-[14px] font-semibold leading-none text-[#1C1C1C]">
          {title}
        </h3>

        <div className="mt-2 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <img
              src={calendar}
              alt=""
              aria-hidden="true"
              className="h-[14px] w-[14px] flex-shrink-0"
            />

            <span className="text-[12px] font-medium leading-none text-[#7F7F7F]">
              {firstInfo}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <img
              src={location}
              alt=""
              aria-hidden="true"
              className="h-[14px] w-[14px] flex-shrink-0"
            />

            <span className="text-[12px] font-medium leading-none text-[#7F7F7F]">
              {secondInfo}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ContentCard;
