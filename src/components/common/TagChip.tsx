import type { CSSProperties } from 'react';

import { tagDefinitionMap } from '../../constants/tags';
import type { TagId } from '../../types/tag.type';

export type TagType = TagId;

interface TagChipProps {
  type: TagType;
  className?: string;
  style?: CSSProperties;
}

function TagChip({ type, className = '', style }: TagChipProps) {
  const tag = tagDefinitionMap[type];

  return (
    <img
      src={tag.assets.cardTagChip.selected}
      alt={tag.label}
      className={`shrink-0 ${className}`}
      style={style}
      draggable={false}
    />
  );
}

export default TagChip;