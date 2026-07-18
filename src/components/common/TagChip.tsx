import { tagDefinitionMap } from '../../constants/tags';
import type { TagId } from '../../types/tag.type';

export type TagType = TagId;

interface TagChipProps {
  type: TagType;
  className?: string;
}

function TagChip({ type, className = '' }: TagChipProps) {
  const tag = tagDefinitionMap[type];

  return (
    <img
      src={tag.assets.cardTagChip.selected}
      alt={tag.label}
      className={`shrink-0 ${className}`}
      draggable={false}
    />
  );
}

export default TagChip;
