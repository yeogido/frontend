import darkStar from '../../assets/icons/dark star.svg';
import heart from '../../assets/icons/heart.svg';
import { useScaleFrame } from '../../hooks/useScaleFrame';

// CourseReviewCard와 같은 값이어야 로딩 중과 로딩 후의 카드 크기가 맞는다.
const CARD_DESIGN_WIDTH = 342;
const CARD_HEIGHT = 166;

function CourseReviewCardSkeleton() {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <article
        ref={innerRef}
        role="status"
        aria-label="최근 후기를 불러오는 중"
        className="relative animate-pulse overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: CARD_DESIGN_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="flex gap-4 p-3">
          <div className="h-[88px] w-[119px] shrink-0 rounded-lg bg-[#E4E4E4]" />

          <div className="flex flex-1 flex-col gap-3 pt-1">
            <div className="h-4 w-[130px] rounded bg-[#E4E4E4]" />
            <div className="h-3 w-[160px] rounded bg-[#E4E4E4]" />
            <div className="flex gap-2">
              <div className="h-5 w-12 rounded-full bg-[#E4E4E4]" />
              <div className="h-5 w-14 rounded-full bg-[#E4E4E4]" />
              <div className="h-5 w-10 rounded-full bg-[#E4E4E4]" />
            </div>
          </div>

          <img
            src={heart}
            alt=""
            aria-hidden="true"
            className="absolute top-3 right-3 size-5 opacity-30"
          />
        </div>

        <div className="mx-4 border-t border-[#E4E4E4]" />

        <div className="flex items-center gap-2 px-4 pt-3">
          <div className="size-7 rounded-full bg-[#E4E4E4]" />

          <div className="flex flex-col gap-1">
            <div className="h-3 w-20 rounded bg-[#E4E4E4]" />

            <div className="flex gap-[2px]">
              {Array.from({ length: 5 }).map((_, index) => (
                <img
                  key={index}
                  src={darkStar}
                  alt=""
                  aria-hidden="true"
                  className="size-[14px] scale-[1.42] opacity-30"
                />
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default CourseReviewCardSkeleton;
