import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useMeasuredScaledHeight } from '../../hooks/useMeasuredScaledHeight';

// ReviewCard와 동일한 디자인 기준
const CARD_DESIGN_WIDTH = 342;
const CARD_PADDING = 16;
const SECTION_GAP = 12;
const CARD_RADIUS = 16;

const IMAGE_SIZE = 129;
const IMAGE_GAP = 12;

const AVATAR_SIZE = 28;
const PROFILE_GAP = 8;

function ReviewCardSkeleton() {
  const scale = useGlobalScale();
  const { innerRef, scaledHeight } = useMeasuredScaledHeight(scale);

  return (
    <div
      className="shrink-0 overflow-hidden"
      style={{
        width: CARD_DESIGN_WIDTH * scale,
        height: scaledHeight,
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: CARD_DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <article
          role="status"
          aria-label="후기 정보를 불러오는 중"
          className="flex flex-col overflow-hidden animate-pulse bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
          style={{ borderRadius: CARD_RADIUS }}
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
              gap: SECTION_GAP,
              padding: CARD_PADDING,
              paddingTop: SECTION_GAP,
            }}
          >
            {/* Review */}
            <div className="flex flex-col gap-[6px]">
              <div className="h-[14px] w-full rounded bg-[#EAEAEA]" />
              <div className="h-[14px] w-[220px] rounded bg-[#EAEAEA]" />
            </div>

            {/* Profile */}
            <div
              className="flex items-center"
              style={{ gap: PROFILE_GAP }}
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
                    <div
                      key={index}
                      className="h-[14px] w-[14px] rounded bg-[#EAEAEA]"
                    />
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