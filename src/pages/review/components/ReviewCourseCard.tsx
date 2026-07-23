import { IoCalendarOutline, IoLocationSharp, IoPerson } from 'react-icons/io5';
import defaultThumbnail from '../../course-region-search/assets/cities/gangwon.webp';

export interface ReviewCourseCardProps {
  title?: string;
  image?: string;
  thumbnailUrl?: string;
  duration?: string;
  courseType?: string;
  companion?: string;
}

function ReviewCourseCard({
  title = '강릉 혼자 여행 코스',
  image,
  thumbnailUrl,
  duration = '2박 3일',
  courseType = '뚜벅이 코스',
  companion = '혼자',
}: ReviewCourseCardProps) {
  const thumbnail = image || thumbnailUrl || defaultThumbnail;

  return (
    <section
      aria-label="리뷰할 코스"
      className="bg-background mt-[29px] flex min-h-[100px] items-center rounded-xl px-3 py-3"
    >
      <img
        src={thumbnail}
        alt={title}
        className="h-[76px] w-[103px] shrink-0 rounded-lg object-cover"
      />
      <div className="ml-3 min-w-0 flex-1">
        <h2 className="truncate text-[15px] leading-5 font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        <div className="text-gray-4 mt-3 flex flex-wrap items-center gap-x-[9px] gap-y-1 text-[11px] leading-4">
          {duration && (
            <span className="flex items-center gap-[3px] whitespace-nowrap">
              <IoCalendarOutline aria-hidden="true" className="text-[13px]" />
              {duration}
            </span>
          )}
          {courseType && (
            <span className="flex items-center gap-[2px] whitespace-nowrap">
              <IoLocationSharp aria-hidden="true" className="text-[13px]" />
              {courseType}
            </span>
          )}
          {companion && (
            <span className="flex items-center gap-[3px] whitespace-nowrap">
              <IoPerson aria-hidden="true" className="text-[12px]" />
              {companion}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

export default ReviewCourseCard;
