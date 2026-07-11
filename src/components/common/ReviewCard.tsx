import type { KeyboardEvent } from 'react';
import star from '../../assets/icons/star.svg';

export interface ReviewCardProps {
  profileImage: string;
  nickname: string;
  meta: string;
  content: string;
  rating?: number;
  onClick?: () => void;
  className?: string;
}

function ReviewCard({
  profileImage,
  nickname,
  meta,
  content,
  rating = 5,
  onClick,
  className = '',
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
        w-[min(78vw,220px)]
        shrink-0
        flex-col
        justify-between
        rounded-xl
        bg-[#F9F9F9]
        p-4
        shadow-[0_1px_5px_rgba(0,0,0,0.07)]
        sm:w-[220px]
        lg:h-[132px]
        lg:w-full
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <p className="line-clamp-3 w-full text-[14px] leading-[18px] font-normal text-[#1C1C1C] lg:leading-5">
        {content}
      </p>

      <div className="flex items-end gap-2">
        {profileImage ? (
          <img
            src={profileImage}
            alt={`${nickname} 프로필`}
            className="h-6 w-6 rounded-full object-cover lg:h-8 lg:w-8"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-[#EAEAEA] lg:h-8 lg:w-8" />
        )}

        <div className="flex min-w-0 flex-col gap-[2px]">
          <div className="flex min-w-0 items-center">
            <span className="truncate text-[12px] leading-none font-semibold text-[#1C1C1C]">
              {nickname}
            </span>

            <span className="mx-[4px] text-[10px] leading-none font-normal text-[#7F7F7F]">
              ·
            </span>

            <span className="truncate text-[10px] leading-none font-normal text-[#7F7F7F]">
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
