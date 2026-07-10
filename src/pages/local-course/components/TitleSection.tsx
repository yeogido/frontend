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
  neutral: 'border-gray-2 text-gray-5',
};

function TitleSection({ title, tags }: TitleSectionProps) {
  return (
    <section className="rounded-xl px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-[22px] leading-8 font-bold text-black sm:text-[28px] sm:leading-10">
          {title}
        </h1>

        <button
          type="button"
          aria-label="코스 공유하기"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-2 bg-white text-black"
        >
          <ShareIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map(({ id, label, icon, tone }) => {
          const Icon = tagIcons[icon];

          return (
            <span
              key={id}
              className={`inline-flex h-7 items-center gap-1 rounded-full border bg-white px-3 text-[12px] leading-none font-semibold ${tagToneClassNames[tone]}`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </span>
          );
        })}
      </div>
    </section>
  );
}

export default TitleSection;
