import type { TagId, TagDefinition } from '../../../types/tag.type';

export type { TagDefinition, TagId };

export interface PhotoSelection {
  file: File;
  previewUrl: string;
}

export interface TagSelectionResult {
  photo: File;
  tagIds: TagId[];
}
