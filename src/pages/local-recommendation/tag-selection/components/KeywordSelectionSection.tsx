import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { scaleValue } from '../../../../utils/responsiveLayout';
import { tagDefinitions } from '../../../../constants/tags';
import type { TagId } from '../types';
import TagChip from './TagChip';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 31;
const TITLE_ROW_GAP = 6;
const TITLE_SIZE = 16;
const LIMIT_TEXT_SIZE = 12;
const ROWS_MARGIN_TOP = 12;
const ROWS_GAP = 8;
const ROW_GAP = 8;

const tagRows = [
  tagDefinitions.slice(0, 4),
  tagDefinitions.slice(4, 9),
  tagDefinitions.slice(9, 13),
];

interface KeywordSelectionSectionProps {
  selectedTagIds: ReadonlySet<TagId>;
  limitMessage: string;
  onToggle: (tagId: TagId) => void;
}

function KeywordSelectionSection({
  selectedTagIds,
  limitMessage,
  onToggle,
}: KeywordSelectionSectionProps) {
  const scale = useGlobalScale();

  return (
    <section
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
      aria-labelledby="keyword-title"
    >
      <div
        className="flex items-baseline"
        style={{ gap: TITLE_ROW_GAP * scale }}
      >
        <h2
          id="keyword-title"
          className="font-semibold"
          style={{ fontSize: scaleValue(TITLE_SIZE, scale, 14) }}
        >
          키워드 등록
        </h2>
        <span
          className="text-gray-4"
          style={{ fontSize: scaleValue(LIMIT_TEXT_SIZE, scale, 11) }}
        >
          (최대 5개)
        </span>
      </div>

      <div
        className="flex flex-col items-center"
        style={{ marginTop: ROWS_MARGIN_TOP * scale, gap: ROWS_GAP * scale }}
      >
        {tagRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex w-full justify-center"
            style={{
              gap: `min(${ROW_GAP * scale}px, calc((100% - ${
                MIN_TOUCH_TARGET * row.length
              }px) / ${row.length - 1}))`,
            }}
          >
            {row.map((tag) => (
              <TagChip
                key={tag.id}
                tag={tag}
                selected={selectedTagIds.has(tag.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {limitMessage}
      </p>
    </section>
  );
}

export default KeywordSelectionSection;
