import React from 'react';
import TagChip from '../common/TagChip';
import type { DetailTag } from '../../types/detail';

export interface DetailTitleSectionProps {
  readonly title: string;
  readonly tags: readonly DetailTag[];
  readonly action?: React.ReactNode;
  readonly className?: string;
}

export function DetailTitleSection({
  title,
  tags,
  action,
  className = '',
}: DetailTitleSectionProps) {
  return (
    <section className={`bg-white ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 text-[20px] leading-7 font-bold break-keep text-[#1C1C1C]">
          {title}
        </h1>
        {action && <div className="shrink-0 pt-0.5">{action}</div>}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <TagChip key={tag.id} type={tag.tagId} className="h-[26px]" />
        ))}
      </div>
    </section>
  );
}

export default DetailTitleSection;
