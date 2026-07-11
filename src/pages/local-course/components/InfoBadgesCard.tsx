import type { CourseInfoBadge } from '../types/course';

import { badgeIcons } from './icons';

interface InfoBadgesCardProps {
  badges: CourseInfoBadge[];
}

function InfoBadgesCard({ badges }: InfoBadgesCardProps) {
  return (
    <section className="mt-4 px-7">
      <div className="bg-background grid grid-cols-4 overflow-hidden rounded-xl">
        {badges.map(({ id, label, icon }) => {
          const Icon = badgeIcons[icon];

          return (
            <div
              key={id}
              className="flex min-h-[17.5] min-w-0 flex-col items-center justify-center gap-1.5 px-1.5 py-2 text-center"
            >
              <Icon className="text-gray-5 h-5 w-5 shrink-0" />
              <span className="text-gray-5 w-full truncate text-[10px] leading-4 font-medium min-[360px]:text-[11px]">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default InfoBadgesCard;
