import { MAX_SELECTED_TAGS } from '../../../constants/tags';
import type { TagId } from './types';

export interface ToggleTagResult {
  selectedTagIds: Set<TagId>;
  limitReached: boolean;
}

// local-recommendation/tag-selection/utils.ts의 toggleTag를 그대로 복사했다
// (동일한 Set 토글 로직이라 그대로 재사용 가능).
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
