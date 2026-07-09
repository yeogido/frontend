import type { KeyboardEvent } from 'react';
import star from '../../assets/icons/star.svg';

export interface ReviewCardProps {
  profileImage: string;
  nickname: string;
  meta: string;
  content: string;
  rating?: number;
  onClick?: () => void;
}

function ReviewCard({
  profileImage,
  nickname,
  meta,
  content,
  rating = 5,
  onClick,
}: ReviewCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <article
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        flex
        h-[115px]
        w-[220px]
        shrink-0
        flex-col
        justify-between
        rounded-xl
        bg-[#F9F9F9]
        p-4
        shadow-[0_1px_5px_rgba(0,0,0,0.07)]
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Review */}
      <p
        className="
          w-full
          line-clamp-3
          text-[14px]
          font-normal
          leading-[100%]
          text-[#1C1C1C]
        "
      >
        {content}
      </p>

      {/* Footer */}
      <div className="flex items-end gap-2">
        {profileImage ? (
          <img
            src={profileImage}
            alt={`${nickname} 프로필`}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-[#EAEAEA]" />
        )}

        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center">
            <span
              className="
                text-[12px]
                font-semibold
                leading-none
                text-[#1C1C1C]
              "
            >
              {nickname}
            </span>

            <span
              className="
                mx-[2px]
                text-[10px]
                font-normal
                leading-none
                text-[#7F7F7F]
              "
            >
              ·
            </span>

            <span
              className="
                text-[10px]
                font-normal
                leading-none
                text-[#7F7F7F]
              "
            >
              {meta}
            </span>
          </div>

          <div className="flex items-center gap-[2px]">
            {Array.from({ length: rating }).map((_, index) => (
              <img
                key={index}
                src={star}
                alt=""
                aria-hidden="true"
                className="h-[9px] w-[9px]"
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default ReviewCard;