import { useScaleFrame } from '../../../hooks/useScaleFrame';

const CARD_DESIGN_WIDTH = 342;
const CARD_PADDING_TOP = 21;
const CARD_PADDING_RIGHT = 79;
const CARD_PADDING_BOTTOM = 20;
const CARD_PADDING_LEFT = 20;
const AVATAR_SIZE = 60;
const CONTENT_GAP = 24; // 추정값, 실측 필요
const NAME_SIZE = 18;
const DATE_SIZE = 14;
const DATE_MARGIN_TOP = 4;
const CARD_MARGIN_Y = 24; // 390 기준 카드 상하 바깥 여백

interface DetailAuthorCardProps {
  avatarUrl: string;
  name: string;
  date: string;
}

function DetailAuthorCard({ avatarUrl, name, date }: DetailAuthorCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{
        height: scaledHeight,
        marginTop: CARD_MARGIN_Y * scale,
        marginBottom: CARD_MARGIN_Y * scale,
      }}
    >
      <div
        ref={innerRef}
        className="bg-background flex items-center rounded-xl"
        style={{
          width: CARD_DESIGN_WIDTH,
          paddingTop: CARD_PADDING_TOP,
          paddingRight: CARD_PADDING_RIGHT,
          paddingBottom: CARD_PADDING_BOTTOM,
          paddingLeft: CARD_PADDING_LEFT,
          gap: CONTENT_GAP,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <img
          src={avatarUrl}
          alt=""
          aria-hidden="true"
          className="shrink-0 rounded-full object-cover"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        />

        <div className="min-w-0">
          <p
            className="truncate font-medium text-black"
            style={{ fontSize: NAME_SIZE }}
          >
            {name}
          </p>

          <p
            className="font-regular text-gray-4 truncate"
            style={{ fontSize: DATE_SIZE, marginTop: DATE_MARGIN_TOP }}
          >
            {date}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DetailAuthorCard;
