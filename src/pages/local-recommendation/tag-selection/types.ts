import type { TagId, TagDefinition } from '../../../types/tag.type';

export type { TagDefinition, TagId };

export interface PhotoSelection {
  /** 수정 진입 시 기존 사진만 있고 새로 고르지 않았다면 null. */
  file: File | null;
  previewUrl: string;
}

export interface TagSelectionResult {
  photo: File | null;
  tagIds: TagId[];
  /** presigned-url 업로드로 얻은 대표 사진의 실제 오브젝트 키 */
  photoKey: string;
  /** tagIds를 서버 해시태그 목록에 매핑해 얻은 실제 숫자 id 목록 */
  hashtagIds: number[];
}
