import type { PhotoSelection, TagId, TagSelectionResult } from './types';

export const EVENT_SELECTION_PATH =
  '/local-recommendation/event-selection' as const;

export const VISIT_ORDER_SELECTION_PATH =
  '/local-recommendation/visit-order-selection' as const;

interface CompleteTagSelectionOptions {
  photo: PhotoSelection;
  selectedTagIds: ReadonlySet<TagId>;
  /** 업로드 완료 후 얻은 대표 사진의 오브젝트 키 */
  photoKey: string;
  /** tagIds를 서버 해시태그 목록에 매핑한 결과 (mapTagIdsToHashtagIds 참고) */
  hashtagIds: number[];
  onComplete?: (result: TagSelectionResult) => void;
  /** 수정 흐름이면 일차를 되짚지 않고 수정 화면(허브)으로 돌아간다. */
  isEditingCourse?: boolean;
  navigate: (path: string) => void;
}

export const completeTagSelection = ({
  photo,
  selectedTagIds,
  photoKey,
  hashtagIds,
  onComplete,
  isEditingCourse = false,
  navigate,
}: CompleteTagSelectionOptions) => {
  onComplete?.({
    photo: photo.file,
    tagIds: Array.from(selectedTagIds),
    photoKey,
    hashtagIds,
  });
  // 등록 흐름은 1일차 행사 선택부터 시작한다. 수정 흐름은 키워드만 손보러
  // 들어온 것이라 선택 단계를 다시 밟지 않고 수정 화면으로 돌아간다.
  navigate(
    isEditingCourse
      ? VISIT_ORDER_SELECTION_PATH
      : `${EVENT_SELECTION_PATH}?day=1`
  );
  return true;
};
