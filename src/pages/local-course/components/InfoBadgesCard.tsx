import type { CourseInfoBadge } from '../types/course';

import { badgeIcons } from './icons';

interface InfoBadgesCardProps {
  badges: CourseInfoBadge[];
}

function InfoBadgesCard({ badges }: InfoBadgesCardProps) {
  return (
    <section>
      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl">
        {badges.map(({ id, label, icon }) => {
          const Icon = badgeIcons[icon];

          return (
            <div
              key={id}
              className="flex min-h-[82px] flex-col items-center justify-center gap-2 bg-gray-2 px-3"
            >
              <Icon className="h-[18px] w-[18px] text-black" />
              <span className="text-[12px] leading-none font-semibold text-gray-5">
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
