import type { TagDefinition } from '../types';

interface TagChipProps {
  tag: TagDefinition;
  selected: boolean;
  onToggle: (tagId: TagDefinition['id']) => void;
}

function TagChip({ tag, selected, onToggle }: TagChipProps) {
  return (
    <button
      type="button"
      aria-label={`${tag.label} 키워드`}
      aria-pressed={selected}
      onClick={() => onToggle(tag.id)}
      className="focus-visible:outline-main-5 min-w-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <img
        src={
          selected
            ? tag.assets.tagChip.selected
            : tag.assets.tagChip.inactive
        }
        alt=""
        aria-hidden="true"
        className="block h-auto max-h-[25px] w-auto max-w-full"
      />
    </button>
  );
}

export default TagChip;
