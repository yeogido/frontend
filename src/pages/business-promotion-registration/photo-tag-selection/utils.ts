import { MAX_SELECTED_TAGS } from '../../../constants/tags';
import type { TagId } from './types';

export const MAX_PHOTOS = 5;

/** 파일 선택창에서 고른 것 중 남은 자리만큼만 받고, 안내 문구를 돌려준다. */
export const pickPhotoFiles = (
  files: readonly File[],
  remainingSlots: number
): { accepted: File[]; errorMessage: string } => {
  if (files.some((file) => !file.type.startsWith('image/'))) {
    return { accepted: [], errorMessage: '이미지 파일만 등록할 수 있어요.' };
  }

  return {
    accepted: files.slice(0, remainingSlots),
    errorMessage:
      files.length > remainingSlots
        ? `대표 사진은 최대 ${MAX_PHOTOS}장까지 등록할 수 있어요.`
        : '',
  };
};

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
