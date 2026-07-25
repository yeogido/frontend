import { badgeDefinitionMap } from '../../../constants/badges';
import type { CourseInfoBadgeTuple } from '../types/courseDetail';

export interface CourseInfoBadgesCardProps {
  readonly badges: CourseInfoBadgeTuple;
  readonly className?: string;
}

export function CourseInfoBadgesCard({
  badges,
  className = '',
}: CourseInfoBadgesCardProps) {
  return (
    <div className={`bg-[#F6F7F8] grid grid-cols-4 items-center justify-items-center rounded-[14px] px-2 py-3 ${className}`}>
      {badges.map(({ id, label, icon }) => {
        const badgeDef = badgeDefinitionMap[icon];
        return (
          <div
            key={id}
            className="flex min-w-0 flex-col items-center justify-center gap-1 text-center"
          >
            {badgeDef && (
              <img
                src={badgeDef.icon}
                alt={label}
                className="h-5 w-5 shrink-0"
                draggable={false}
              />
            )}
            <span className="w-full truncate text-[11px] leading-none font-medium text-[#505050]">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default CourseInfoBadgesCard;
