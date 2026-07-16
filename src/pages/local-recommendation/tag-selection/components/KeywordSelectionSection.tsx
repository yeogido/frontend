import { tagDefinitions } from '../../../../constants/tags';
import type { TagId } from '../types';
import TagChip from './TagChip';

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
  return (
    <section className="mt-[31px]" aria-labelledby="keyword-title">
      <div className="flex items-baseline gap-1.5">
        <h2 id="keyword-title" className="text-base font-semibold">
          키워드 등록
        </h2>
        <span className="text-gray-4 text-xs">(최대 5개)</span>
      </div>

      <div className="mt-3 flex flex-col items-center gap-2">
        {tagRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex w-full justify-center gap-x-2"
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
