import darkStar from '../../assets/icons/dark star.svg';
import heart from '../../assets/icons/heart.svg';

function CourseReviewCardSkeleton() {
  return (
    <article
      role="status"
      aria-label="최근 후기를 불러오는 중"
      className="relative h-[166px] w-full animate-pulse overflow-hidden rounded-xl bg-[#f9f9f9] shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
    >
      <div className="flex gap-4 p-3">
        <div className="h-[88px] w-[119px] shrink-0 rounded-lg bg-[#e4e4e4]" />
        <div className="flex flex-1 flex-col gap-3 pt-1">
          <div className="h-4 w-[130px] rounded bg-[#e4e4e4]" />
          <div className="h-3 w-[160px] rounded bg-[#e4e4e4]" />
          <div className="flex gap-2">
            <div className="h-5 w-12 rounded-full bg-[#e4e4e4]" />
            <div className="h-5 w-14 rounded-full bg-[#e4e4e4]" />
            <div className="h-5 w-10 rounded-full bg-[#e4e4e4]" />
          </div>
        </div>
        <img src={heart} alt="" aria-hidden="true" className="absolute top-3 right-3 size-5 opacity-30" />
      </div>
      <div className="mx-4 border-t border-[#e4e4e4]" />
      <div className="flex items-center gap-2 px-4 pt-3">
        <div className="size-7 rounded-full bg-[#e4e4e4]" />
        <div className="flex flex-col gap-1"><div className="h-3 w-20 rounded bg-[#e4e4e4]" /><div className="flex gap-[2px]">{Array.from({ length: 5 }).map((_, index) => <img key={index} src={darkStar} alt="" aria-hidden="true" className="size-[14px] scale-[1.42] opacity-30" />)}</div></div>
      </div>
    </article>
  );
}

export default CourseReviewCardSkeleton;
