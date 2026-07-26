import { useGlobalScale } from '../../hooks/useGlobalScale';
import { scaleValue } from '../../utils/responsiveLayout';

// Figma 390 디자인 기준 리터럴 px
const CARD_RADIUS = 14;
const CARD_PADDING_X = 16;
const CARD_PADDING_Y = 14;
const TITLE_FONT_SIZE = 12;
const CONTENT_MARGIN_TOP = 8;
const CONTENT_FONT_SIZE = 12;
const CONTENT_LINE_HEIGHT = 18;

export interface DetailDescriptionCardProps {
  readonly title: string;
  readonly content: string;
  readonly className?: string;
}

export function DetailDescriptionCard({
  title,
  content,
  className = '',
}: DetailDescriptionCardProps) {
  const scale = useGlobalScale();

  return (
    <article
      className={`bg-main-2 ${className}`}
      style={{
        borderRadius: CARD_RADIUS * scale,
        paddingLeft: CARD_PADDING_X * scale,
        paddingRight: CARD_PADDING_X * scale,
        paddingTop: CARD_PADDING_Y * scale,
        paddingBottom: CARD_PADDING_Y * scale,
      }}
    >
      <h2
        className="text-main-5 leading-none font-bold"
        style={{ fontSize: scaleValue(TITLE_FONT_SIZE, scale, 12) }}
      >
        {title}
      </h2>
      <p
        className="text-gray-4 font-normal break-keep whitespace-pre-line"
        style={{
          marginTop: CONTENT_MARGIN_TOP * scale,
          fontSize: scaleValue(CONTENT_FONT_SIZE, scale, 12),
          lineHeight: `${scaleValue(CONTENT_LINE_HEIGHT, scale, 16)}px`,
        }}
      >
        {content}
      </p>
    </article>
  );
}

export default DetailDescriptionCard;
