import React from 'react';
import TagChip from '../../../components/common/TagChip';
import type { DetailTag } from '../../../types/detail';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const HEADER_GAP = 12;
const TITLE_FONT_SIZE = 20;
const TITLE_LINE_HEIGHT = 28;
const ACTION_PADDING_TOP = 2;
const TAGS_MARGIN_TOP = 10;
const TAGS_GAP = 6;
const TAG_HEIGHT = 26;

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
  const scale = useGlobalScale();

  return (
    <section className={`bg-white ${className}`}>
      <div
        className="flex items-start justify-between"
        style={{ gap: HEADER_GAP * scale }}
      >
        <h1
          className="min-w-0 font-bold break-keep text-[#1C1C1C]"
          style={{
            fontSize: TITLE_FONT_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          {title}
        </h1>
        {action && (
          <div
            className="shrink-0"
            style={{ paddingTop: ACTION_PADDING_TOP * scale }}
          >
            {action}
          </div>
        )}
      </div>

      <div
        className="flex flex-wrap items-center"
        style={{ marginTop: TAGS_MARGIN_TOP * scale, gap: TAGS_GAP * scale }}
      >
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            type={tag.tagId}
            className="w-auto"
            style={{ height: TAG_HEIGHT * scale }}
          />
        ))}
      </div>
    </section>
  );
}

export default DetailTitleSection;
