import type { PhotoSelection, TagId, TagSelectionResult } from './types';

export const EVENT_SELECTION_PATH =
  '/local-recommendation/event-selection' as const;

interface CompleteTagSelectionOptions {
  photo: PhotoSelection;
  selectedTagIds: ReadonlySet<TagId>;
  /** 업로드 완료 후 얻은 대표 사진의 오브젝트 키 */
  photoKey: string;
  /** tagIds를 서버 해시태그 목록에 매핑한 결과 (mapTagIdsToHashtagIds 참고) */
  hashtagIds: number[];
  onComplete?: (result: TagSelectionResult) => void;
  navigate: (path: typeof EVENT_SELECTION_PATH) => void;
}

export const completeTagSelection = ({
  photo,
  selectedTagIds,
  photoKey,
  hashtagIds,
  onComplete,
  navigate,
}: CompleteTagSelectionOptions) => {
  onComplete?.({
    photo: photo.file,
    tagIds: Array.from(selectedTagIds),
    photoKey,
    hashtagIds,
  });
  navigate(EVENT_SELECTION_PATH);
  return true;
};
