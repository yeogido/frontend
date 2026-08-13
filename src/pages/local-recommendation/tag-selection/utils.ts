import { MAX_SELECTED_TAGS } from '../../../constants/tags';
import type { PhotoSelection, TagId } from './types';

export interface ToggleTagResult {
  selectedTagIds: Set<TagId>;
  limitReached: boolean;
}

export const toggleTag = (
  current: ReadonlySet<TagId>,
  tagId: TagId
): ToggleTagResult => {
  const next = new Set(current);

  if (next.has(tagId)) {
    next.delete(tagId);
    return { selectedTagIds: next, limitReached: false };
  }

  if (next.size >= MAX_SELECTED_TAGS) {
    return { selectedTagIds: next, limitReached: true };
  }

  next.add(tagId);
  return { selectedTagIds: next, limitReached: false };
};

export const isTagSelectionReady = (
  photo: PhotoSelection | null,
  selectedTagIds: ReadonlySet<TagId>
) => photo !== null && selectedTagIds.size > 0;
