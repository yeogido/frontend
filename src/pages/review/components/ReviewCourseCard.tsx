import {
  IoCalendarOutline,
  IoImageOutline,
  IoLocationSharp,
  IoPerson,
} from 'react-icons/io5';

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
  const thumbnail = image || thumbnailUrl;

  return (
    <section
      aria-label="리뷰할 코스"
      className="bg-background mt-[29px] flex min-h-[100px] items-center rounded-xl px-3 py-3"
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="h-[76px] w-[103px] shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="bg-gray-2 text-gray-4 flex h-[76px] w-[103px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg">
          <IoImageOutline aria-hidden="true" className="text-[20px]" />
          <span className="text-[10px] font-medium">이미지 없음</span>
        </div>
      )}
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
