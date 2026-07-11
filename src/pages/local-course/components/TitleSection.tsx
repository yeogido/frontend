import type { CourseTag } from '../types/course';

import { ShareIcon, tagIcons } from './icons';

interface TitleSectionProps {
  title: string;
  tags: CourseTag[];
}

const tagToneClassNames = {
  primary: 'border-main-5 text-main-5',
  green: 'border-green-3 text-green-3',
  blue: 'border-blue-3 text-blue-3',
  sky: 'border-sky-3 text-blue-3',
  neutral: 'border-gray-4 text-gray-5',
};

function TitleSection({ title, tags }: TitleSectionProps) {
  return (
    <section className="bg-white px-5 pt-5 pb-0">
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 text-[18px] leading-7 font-bold break-keep text-black">
          {title}
        </h1>

        <button
          type="button"
          aria-label="코스 공유하기"
          className="flex h-8 w-8 shrink-0 items-center justify-center bg-white text-black"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map(({ id, label, icon, tone }) => {
          const Icon = tagIcons[icon];

          return (
            <span
              key={id}
              className={`inline-flex h-6 max-w-full items-center gap-1 rounded-full border bg-white px-2.5 text-[12px] leading-none font-medium whitespace-nowrap ${tagToneClassNames[tone]}`}
            >
              <Icon className="h-3 w-3 shrink-0" />
              {label}
            </span>
          );
        })}
      </div>
    </section>
  );
}

export default TitleSection;
