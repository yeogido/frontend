import type { CourseTag } from '../types/course';

import { ShareIcon, tagIcons } from './icons';

interface TitleSectionProps {
  title: string;
  tags: CourseTag[];
}

const tagToneClassNames = {
  primary: 'border-[var(--color-primary)] text-[var(--color-primary)]',
  green: 'border-[var(--color-green)] text-[var(--color-green)]',
  blue: 'border-[var(--color-blue)] text-[var(--color-blue)]',
  sky: 'border-[var(--color-sky)] text-[var(--color-blue)]',
  neutral: 'border-[var(--color-line)] text-[var(--color-text-muted)]',
};

function TitleSection({ title, tags }: TitleSectionProps) {
  return (
    <section className="rounded-xl px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-[22px] leading-8 font-bold text-[var(--color-text)] sm:text-[28px] sm:leading-10">
          {title}
        </h1>

        <button
          type="button"
          aria-label="코스 공유하기"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-text)]"
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
              className={`inline-flex h-7 items-center gap-1 rounded-full border bg-[var(--color-surface)] px-3 text-[12px] leading-none font-semibold ${tagToneClassNames[tone]}`}
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
