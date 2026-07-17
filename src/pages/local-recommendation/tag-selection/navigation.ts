import type { PhotoSelection, TagId, TagSelectionResult } from './types.ts';

export const EVENT_SELECTION_PATH =
  '/local-recommendation/event-selection' as const;

interface CompleteTagSelectionOptions {
  photo: PhotoSelection;
  selectedTagIds: ReadonlySet<TagId>;
  onComplete?: (result: TagSelectionResult) => void;
  navigate: (path: typeof EVENT_SELECTION_PATH) => void;
}

export const completeTagSelection = ({
  photo,
  selectedTagIds,
  onComplete,
  navigate,
}: CompleteTagSelectionOptions) => {
  onComplete?.({
    photo: photo.file,
    tagIds: Array.from(selectedTagIds),
  });
  navigate(EVENT_SELECTION_PATH);
  return true;
};
