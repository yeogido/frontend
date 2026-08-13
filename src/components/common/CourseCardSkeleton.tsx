import heart from '../../assets/icons/heart.svg';

import { useScaleFrame } from '../../hooks/useScaleFrame';

const CARD_WIDTH = 342;
const CARD_HEIGHT = 100;
const IMAGE_WIDTH = 136;
const CONTENT_PADDING_X = 16;
const CONTENT_PADDING_Y = 16;
const HEART_SIZE = 20;
const HEART_OFFSET = 12;
const TITLE_HEIGHT = 16;
const TITLE_WIDTH = 150;
const META_ICON_SIZE = 14;
const META_TEXT_HEIGHT = 12;
const META_GAP = 8;
const META_ITEM_GAP = 2;
const META_MARGIN_TOP = 8;
const TAG_HEIGHT = 24;
const TAG_GAP = 8;
const TAG_MARGIN_TOP = 12;

function CourseCardSkeleton() {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_WIDTH);

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <article
        ref={innerRef}
        role="status"
        aria-label="코스 정보를 불러오는 중"
        className="relative flex overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)] animate-pulse"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div
          className="shrink-0 rounded-[8px] bg-[#EAEAEA]"
          style={{ width: IMAGE_WIDTH }}
        />

        <div
          className="flex min-w-0 flex-1 flex-col"
          style={{
            paddingLeft: CONTENT_PADDING_X,
            paddingRight: CONTENT_PADDING_X,
            paddingTop: CONTENT_PADDING_Y,
            paddingBottom: CONTENT_PADDING_Y,
          }}
        >
          <div
            className="rounded bg-[#EAEAEA]"
            style={{ width: TITLE_WIDTH, height: TITLE_HEIGHT }}
          />

          <div
            className="flex items-center"
            style={{ marginTop: META_MARGIN_TOP, gap: META_GAP }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center"
                style={{ gap: META_ITEM_GAP }}
              >
                <div
                  className="rounded bg-[#EAEAEA]"
                  style={{ width: META_ICON_SIZE, height: META_ICON_SIZE }}
                />
                <div
                  className="rounded bg-[#EAEAEA]"
                  style={{ width: 36, height: META_TEXT_HEIGHT }}
                />
              </div>
            ))}
          </div>

          <div
            className="flex items-center"
            style={{ marginTop: TAG_MARGIN_TOP, gap: TAG_GAP }}
          >
            {[48, 56, 44].map((width) => (
              <div
                key={width}
                className="rounded-full bg-[#EAEAEA]"
                style={{ width, height: TAG_HEIGHT }}
              />
            ))}
          </div>
        </div>

        <div
          className="absolute"
          style={{ top: HEART_OFFSET, right: HEART_OFFSET }}
        >
          <img
            src={heart}
            alt=""
            aria-hidden="true"
            className="opacity-30"
            style={{ width: HEART_SIZE, height: HEART_SIZE }}
          />
        </div>
      </article>
    </div>
  );
}

export default CourseCardSkeleton;
