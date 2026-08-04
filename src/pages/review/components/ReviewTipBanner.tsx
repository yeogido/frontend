import tipIcon from '../../travel-record/photo-selection/assets/photo-tip-icon.svg';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const BANNER_MARGIN_TOP = 32;
const BANNER_HEIGHT = 62;
const BANNER_RADIUS = 12;
const BANNER_PADDING_X = 14;
const ICON_CIRCLE_SIZE = 28;
const ICON_SIZE = 18;
const TEXT_MARGIN_LEFT = 16;
const TEXT_FONT_SIZE = 11;
const TEXT_LINE_HEIGHT = 14;

function ReviewTipBanner() {
  const scale = useGlobalScale();

  return (
    <aside
      className="bg-main-2 text-main-5 flex items-center"
      style={{
        marginTop: BANNER_MARGIN_TOP * scale,
        height: BANNER_HEIGHT * scale,
        borderRadius: BANNER_RADIUS * scale,
        paddingLeft: BANNER_PADDING_X * scale,
        paddingRight: BANNER_PADDING_X * scale,
      }}
    >
      <span
        className="bg-main-5 flex shrink-0 items-center justify-center rounded-full text-white"
        style={{
          width: ICON_CIRCLE_SIZE * scale,
          height: ICON_CIRCLE_SIZE * scale,
        }}
      >
        <img
          src={tipIcon}
          alt=""
          aria-hidden="true"
          style={{ width: ICON_SIZE * scale, height: ICON_SIZE * scale }}
        />
      </span>
      <p
        style={{
          marginLeft: TEXT_MARGIN_LEFT * scale,
          fontSize: TEXT_FONT_SIZE * scale,
          lineHeight: `${TEXT_LINE_HEIGHT * scale}px`,
        }}
      >
        다른 여행자에게 도움이 되는 후기를 작성해 보세요!
        <br />
        솔직한 경험이 더 좋은 여행을 만들어줘요
      </p>
    </aside>
  );
}

export default ReviewTipBanner;
