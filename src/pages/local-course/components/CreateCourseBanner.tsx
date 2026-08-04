import addIcon from '../../../assets/icons/material-symbols_add-2-rounded.svg';
import { useScaleFrame } from '../../../hooks/useScaleFrame';

const BANNER_DESIGN_WIDTH = 342;
const BANNER_HEIGHT = 129;
const TITLE_TOP = 24;
const TITLE_LEFT = 16;
const TITLE_SIZE = 16;
const TITLE_LINE_HEIGHT = 19;
const BUTTON_TOP = 78;
const BUTTON_LEFT = 16;
const BUTTON_GAP = 4;
const BUTTON_PADDING_X = 12;
const BUTTON_PADDING_Y = 8;
const BUTTON_RADIUS = 8;
const BUTTON_TEXT_SIZE = 12;
const BUTTON_LINE_HEIGHT = 14;
const ICON_SIZE = 16;

interface CreateCourseBannerProps {
  onClick: () => void;
}

function CreateCourseBanner({ onClick }: CreateCourseBannerProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(BANNER_DESIGN_WIDTH);

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <section
        ref={innerRef}
        className="bg-main-5 relative overflow-hidden"
        style={{
          width: BANNER_DESIGN_WIDTH,
          height: BANNER_HEIGHT,
          borderRadius: BUTTON_RADIUS + 4,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        aria-labelledby="local-course-banner-title"
      >
        <h2
          id="local-course-banner-title"
          className="text-pure-white absolute font-semibold whitespace-nowrap"
          style={{
            top: TITLE_TOP,
            left: TITLE_LEFT,
            fontSize: TITLE_SIZE,
            lineHeight: `${TITLE_LINE_HEIGHT}px`,
          }}
        >
          내가 아는 숨은 명소를
          <br />
          다른 여행자에게 소개해보세요!
        </h2>

        <button
          type="button"
          onClick={onClick}
          className="bg-pure-white text-main-5 absolute inline-flex items-center justify-center font-semibold whitespace-nowrap transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{
            top: BUTTON_TOP,
            left: BUTTON_LEFT,
            gap: BUTTON_GAP,
            borderRadius: BUTTON_RADIUS,
            paddingLeft: BUTTON_PADDING_X,
            paddingRight: BUTTON_PADDING_X,
            paddingTop: BUTTON_PADDING_Y,
            paddingBottom: BUTTON_PADDING_Y,
            fontSize: BUTTON_TEXT_SIZE,
            lineHeight: `${BUTTON_LINE_HEIGHT}px`,
          }}
          aria-label="코스 만들기"
        >
          <span
            className="relative"
            style={{ width: ICON_SIZE, height: ICON_SIZE }}
            aria-hidden="true"
          >
            <img
              src={addIcon}
              alt=""
              className="absolute inset-0 h-full w-full [filter:brightness(0)_saturate(100%)_invert(57%)_sepia(87%)_saturate(2350%)_hue-rotate(333deg)_brightness(102%)_contrast(101%)]"
            />
          </span>
          코스 만들기
        </button>
      </section>
    </div>
  );
}

export default CreateCourseBanner;
