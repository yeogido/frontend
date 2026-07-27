import { useScaleFrame } from '../../../../hooks/useScaleFrame';

const CARD_DESIGN_WIDTH = 342;
const CARD_PADDING_X = 14;
const CARD_PADDING_Y = 20;
const CARD_GAP = 4;
const TITLE_SIZE = 14;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 14; // 추정값, 실측 필요

interface DetailIntroCardProps {
  description: string;
}

function DetailIntroCard({ description }: DetailIntroCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <div
        ref={innerRef}
        className="flex flex-col rounded-xl bg-main-2"
        style={{
          width: CARD_DESIGN_WIDTH,
          paddingLeft: CARD_PADDING_X,
          paddingRight: CARD_PADDING_X,
          paddingTop: CARD_PADDING_Y,
          paddingBottom: CARD_PADDING_Y,
          gap: CARD_GAP,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <p
          className="font-semibold text-main-5"
          style={{ fontSize: TITLE_SIZE }}
        >
          우리 가게를 소개해요
        </p>

        <p
          className="font-medium text-gray-4"
          style={{
            fontSize: DESCRIPTION_SIZE,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT}px`,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default DetailIntroCard;
