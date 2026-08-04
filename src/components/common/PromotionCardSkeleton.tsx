import location from '../../assets/icons/location.svg';

import { useScaleFrame } from '../../hooks/useScaleFrame';

const CARD_DESIGN_WIDTH = 342;

const AVATAR_SIZE = 40;
const PROFILE_GAP = 8;
const HEADER_PADDING_X = 12;
const HEADER_PADDING_TOP = 12;
const HEADER_PADDING_BOTTOM = 8;

const NAME_WIDTH = 80;
const NAME_HEIGHT = 14;

const DATE_WIDTH = 56;
const DATE_HEIGHT = 12;
const DATE_GAP = 4;

const IMAGE_HEIGHT = 266;

const BODY_PADDING_X = 12;
const BODY_PADDING_TOP = 12;
const BODY_PADDING_BOTTOM = 12;

const TITLE_WIDTH = 180;
const TITLE_HEIGHT = 15;

const DESCRIPTION_GAP = 6;
const DESCRIPTION_HEIGHT = 13;

const LOCATION_GAP = 12;
const LOCATION_ICON_GAP = 6;
const LOCATION_ICON_SIZE = 14;
const LOCATION_TEXT_WIDTH = 90;
const LOCATION_TEXT_HEIGHT = 13;

interface PromotionCardSkeletonProps {
  className?: string;
}

function PromotionCardSkeleton({
  className = '',
}: PromotionCardSkeletonProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  return (
    <div
      ref={outerRef}
      className={`w-full overflow-hidden ${className}`}
      style={{ height: scaledHeight }}
    >
      <article
        ref={innerRef}
        role="status"
        aria-label="프로모션 카드 로딩 중"
        className="flex animate-pulse flex-col overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: CARD_DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center"
          style={{
            gap: PROFILE_GAP,
            paddingLeft: HEADER_PADDING_X,
            paddingRight: HEADER_PADDING_X,
            paddingTop: HEADER_PADDING_TOP,
            paddingBottom: HEADER_PADDING_BOTTOM,
          }}
        >
          <div
            className="rounded-full bg-[#EAEAEA]"
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
            }}
          />

          <div>
            <div
              className="rounded bg-[#EAEAEA]"
              style={{
                width: NAME_WIDTH,
                height: NAME_HEIGHT,
              }}
            />

            <div
              className="rounded bg-[#EAEAEA]"
              style={{
                width: DATE_WIDTH,
                height: DATE_HEIGHT,
                marginTop: DATE_GAP,
              }}
            />
          </div>
        </div>

        {/* Image */}
        <div
          className="w-full bg-[#EAEAEA]"
          style={{
            height: IMAGE_HEIGHT,
          }}
        />

        {/* Body */}
        <div
          style={{
            paddingLeft: BODY_PADDING_X,
            paddingRight: BODY_PADDING_X,
            paddingTop: BODY_PADDING_TOP,
            paddingBottom: BODY_PADDING_BOTTOM,
          }}
        >
          <div
            className="rounded bg-[#EAEAEA]"
            style={{
              width: TITLE_WIDTH,
              height: TITLE_HEIGHT,
            }}
          />

          <div
            className="rounded bg-[#EAEAEA]"
            style={{
              width: '100%',
              height: DESCRIPTION_HEIGHT,
              marginTop: DESCRIPTION_GAP,
            }}
          />

          <div
            className="rounded bg-[#EAEAEA]"
            style={{
              width: '75%',
              height: DESCRIPTION_HEIGHT,
              marginTop: 4,
            }}
          />

          <div style={{ marginTop: LOCATION_GAP }}>
            <div
              className="flex items-center"
              style={{ gap: LOCATION_ICON_GAP }}
            >
              <img
                src={location}
                alt=""
                aria-hidden="true"
                style={{
                  width: LOCATION_ICON_SIZE,
                  height: LOCATION_ICON_SIZE,
                }}
              />

              <div
                className="rounded bg-[#EAEAEA]"
                style={{
                  width: LOCATION_TEXT_WIDTH,
                  height: LOCATION_TEXT_HEIGHT,
                }}
              />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default PromotionCardSkeleton;