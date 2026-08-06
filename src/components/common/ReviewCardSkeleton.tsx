import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useMeasuredScaledHeight } from '../../hooks/useMeasuredScaledHeight';
import darkStar from '../../assets/icons/dark star.svg';
import more from '../../assets/icons/more.svg';

// ReviewCard와 동일한 디자인 기준
const CARD_DESIGN_WIDTH = 342;
const CARD_PADDING = 16;
const CARD_RADIUS = 12;
const HOME_CARD_HEIGHT = 286;
const COURSE_REVIEW_LIST_CARD_HEIGHT = 278;

const IMAGE_SIZE = 129;
const IMAGE_GAP = 12;

const AVATAR_SIZE = 28;
const PROFILE_GAP = 8;

interface ReviewCardSkeletonProps {
  variant?: 'home' | 'course-review-list';
}

function ReviewCardSkeleton({ variant = 'home' }: ReviewCardSkeletonProps) {
  const scale = useGlobalScale();
  const { innerRef } = useMeasuredScaledHeight(scale);
  const cardHeight =
    variant === 'course-review-list'
      ? COURSE_REVIEW_LIST_CARD_HEIGHT
      : HOME_CARD_HEIGHT;

  return (
    <div
      className="shrink-0 overflow-hidden"
      style={{
        width: CARD_DESIGN_WIDTH * scale,
        height: cardHeight * scale,
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: CARD_DESIGN_WIDTH,
          height: cardHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <article
          role="status"
          aria-label="후기 정보를 불러오는 중"
          className="flex flex-col overflow-hidden animate-pulse bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
          style={{ height: cardHeight, borderRadius: CARD_RADIUS }}
        >
          {/* Images */}
          <div
            className="flex overflow-hidden"
            style={{
              gap: IMAGE_GAP,
              paddingTop: CARD_PADDING,
              paddingLeft: CARD_PADDING,
            }}
          >
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="shrink-0 rounded-[10px] bg-[#EAEAEA]"
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                }}
              />
            ))}

            {/* peek */}
            <div
              className="shrink-0 rounded-[10px] bg-[#EAEAEA]"
              style={{
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
              }}
            />
          </div>

          {/* Text + Profile */}
          <div
            className="flex flex-col"
            style={{
              gap: 4,
              padding: CARD_PADDING,
              paddingTop: CARD_PADDING,
            }}
          >
            <div className="flex h-[19px] items-center justify-between">
              <div className="h-[16px] w-[150px] rounded bg-[#EAEAEA]" />
              <img src={more} alt="" aria-hidden="true" className="size-5 opacity-30" />
            </div>
            {/* Review */}
            <div className="flex flex-col gap-[6px]">
              <div className="h-[14px] w-[278px] rounded bg-[#EAEAEA]" />
              <div className="h-[14px] w-[208px] rounded bg-[#EAEAEA]" />
            </div>

            {/* Profile */}
            <div
              className="flex items-center"
              style={{ gap: PROFILE_GAP, marginTop: 8 }}
            >
              <div
                className="rounded-full bg-[#EAEAEA]"
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                }}
              />

              <div className="flex flex-col gap-[4px]">
                <div className="h-[12px] w-[90px] rounded bg-[#EAEAEA]" />

                <div className="flex gap-[2px]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <img key={index} src={darkStar} alt="" aria-hidden="true" className="size-[14px] scale-[1.42] opacity-30" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default ReviewCardSkeleton;
