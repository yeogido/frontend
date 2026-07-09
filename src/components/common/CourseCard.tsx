import calendar from '../../assets/icons/calendar.svg';
import heart from '../../assets/icons/heart.svg';
import location from '../../assets/icons/location.svg';
import oheart from '../../assets/icons/oheart.svg';

interface CourseCardProps {
  image: string;
  title: string;
  description: string;
  duration: string;
  courseType: string;
  liked?: boolean;
  onClick?: () => void;
  onLikeClick?: () => void;
}

function CourseCard({
  image,
  title,
  description,
  duration,
  courseType,
  liked = false,
  onClick,
  onLikeClick,
}: CourseCardProps) {
  return (
    <article
      onClick={onClick}
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
        cursor-pointer
      "
    >
      {/* Image */}
      {image ? (
        <img
          src={image}
          alt={title}
          className="h-full w-[136px] rounded-l-xl object-cover"
        />
      ) : (
        <div className="h-full w-[136px] rounded-l-xl bg-[#EAEAEA]" />
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between px-4 py-4">
        {/* Title & Description */}
        <div>
          <h3
            className="
              w-[158px]
              truncate
              text-[16px]
              font-semibold
              leading-none
              text-[#1C1C1C]
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              w-[158px]
              truncate
              text-[12px]
              font-normal
              leading-none
              text-[#7F7F7F]
            "
          >
            {description}
          </p>
        </div>

        {/* Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <img
              src={calendar}
              alt=""
              aria-hidden="true"
              className="h-[14px] w-[14px]"
            />

            <span className="text-[12px] font-medium leading-none text-[#7F7F7F]">
              {duration}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <img
              src={location}
              alt=""
              aria-hidden="true"
              className="h-[14px] w-[14px]"
            />

            <span className="text-[12px] font-medium leading-none text-[#7F7F7F]">
              {courseType}
            </span>
          </div>
        </div>
      </div>

      {/* Like */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onLikeClick?.();
        }}
        className="absolute right-3 top-3"
      >
        <img
          src={liked ? oheart : heart}
          alt="좋아요"
          className="h-5 w-5"
        />
      </button>
    </article>
  );
}

export default CourseCard;