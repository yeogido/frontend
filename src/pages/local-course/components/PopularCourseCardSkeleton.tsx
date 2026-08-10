import { useScaleFrame } from '../../../hooks/useScaleFrame';

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

const IMAGE_HEIGHT = 228;

const BODY_PADDING_X = 16;
const BODY_PADDING_TOP = 12;
const BODY_PADDING_BOTTOM = 16;
const TITLE_WIDTH = 180;
const TITLE_HEIGHT = 16;
const INFO_MARGIN_TOP = 8;
const INFO_HEIGHT = 14;
const TAG_MARGIN_TOP = 12;
const TAG_HEIGHT = 20;
const TAG_WIDTH = 48;
const TAG_GAP = 4;

/** PromotionCardSkeleton과 동일한 방식(회색 블록 + animate-pulse)의
 * PopularCourseCard용 로딩 스켈레톤. */
function PopularCourseCardSkeleton() {
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
        aria-label="코스 카드 로딩 중"
        className="flex animate-pulse flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: CARD_DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
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
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          />
          <div>
            <div
              className="rounded bg-[#EAEAEA]"
              style={{ width: NAME_WIDTH, height: NAME_HEIGHT }}
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

        <div className="w-full bg-[#EAEAEA]" style={{ height: IMAGE_HEIGHT }} />

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
            style={{ width: TITLE_WIDTH, height: TITLE_HEIGHT }}
          />

          <div
            className="rounded bg-[#EAEAEA]"
            style={{
              width: '60%',
              height: INFO_HEIGHT,
              marginTop: INFO_MARGIN_TOP,
            }}
          />

          <div
            className="flex"
            style={{ marginTop: TAG_MARGIN_TOP, gap: TAG_GAP }}
          >
            <div
              className="rounded-full bg-[#EAEAEA]"
              style={{ width: TAG_WIDTH, height: TAG_HEIGHT }}
            />
            <div
              className="rounded-full bg-[#EAEAEA]"
              style={{ width: TAG_WIDTH, height: TAG_HEIGHT }}
            />
          </div>
        </div>
      </article>
    </div>
  );
}

export default PopularCourseCardSkeleton;
