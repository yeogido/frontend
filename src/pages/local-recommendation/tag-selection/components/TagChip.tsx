import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import type { TagDefinition } from '../types';

// Figma 390 디자인 기준 리터럴 px
const TAG_IMAGE_MAX_HEIGHT = 25;

interface TagChipProps {
  tag: TagDefinition;
  selected: boolean;
  onToggle: (tagId: TagDefinition['id']) => void;
}

function TagChip({ tag, selected, onToggle }: TagChipProps) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      aria-label={`${tag.label} 키워드`}
      aria-pressed={selected}
      onClick={() => onToggle(tag.id)}
      className="focus-visible:outline-main-5 flex min-w-0 shrink items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        minWidth: MIN_TOUCH_TARGET,
        minHeight: MIN_TOUCH_TARGET,
      }}
    >
      <img
        src={
          selected ? tag.assets.tagChip.selected : tag.assets.tagChip.inactive
        }
        alt=""
        aria-hidden="true"
        className="block h-auto w-auto max-w-full"
        style={{ maxHeight: TAG_IMAGE_MAX_HEIGHT * scale }}
      />
    </button>
  );
}

export default TagChip;
