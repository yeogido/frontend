import { badgeDefinitionMap } from '../../../constants/badges';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import type { CourseInfoBadgeTuple } from '../types/courseDetail';

// Figma 390 디자인 기준 리터럴 px
const CARD_RADIUS = 14;
const CARD_PADDING_X = 8;
const CARD_PADDING_Y = 14;
const ITEM_GAP = 4;
const ICON_SIZE = 20;
const LABEL_FONT_SIZE = 11;
const LABEL_LINE_HEIGHT = 11;

export interface CourseInfoBadgesCardProps {
  readonly badges: CourseInfoBadgeTuple;
  readonly className?: string;
}

export function CourseInfoBadgesCard({
  badges,
  className = '',
}: CourseInfoBadgesCardProps) {
  const scale = useGlobalScale();

  return (
    <div
      className={`bg-background grid grid-cols-4 items-center justify-items-center ${className}`}
      style={{
        borderRadius: CARD_RADIUS * scale,
        paddingLeft: CARD_PADDING_X * scale,
        paddingRight: CARD_PADDING_X * scale,
        paddingTop: CARD_PADDING_Y * scale,
        paddingBottom: CARD_PADDING_Y * scale,
      }}
    >
      {badges.map(({ id, label, icon }) => {
        const badgeDef = badgeDefinitionMap[icon];
        return (
          <div
            key={id}
            className="flex min-w-0 flex-col items-center justify-center text-center"
            style={{ gap: ITEM_GAP * scale }}
          >
            {badgeDef && (
              <img
                src={badgeDef.icon}
                alt={label}
                className="shrink-0"
                style={{ height: ICON_SIZE * scale, width: ICON_SIZE * scale }}
                draggable={false}
              />
            )}
            <span
              className="w-full truncate font-medium text-[#505050]"
              style={{
                fontSize: LABEL_FONT_SIZE * scale,
                lineHeight: `${LABEL_LINE_HEIGHT * scale}px`,
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default CourseInfoBadgesCard;
