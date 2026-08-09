import type { PlaceItem } from '../../local-recommendation/place-selection/types';

export interface AdminCoursePhoto {
  /**
   * 수정 진입 시 기존 사진을 "미리보기만" 보여줄 때는 file이 없다(실제
   * File 객체를 만들 수 없어서). 새로 고르면 실제 File이 들어온다.
   */
  file: File | null;
  previewUrl: string;
}

export interface AdminCoursePlaceItem extends PlaceItem {
  photoFile: File | null;
  photoPreviewUrl: string | null;
  /**
   * 코스 수정 진입 시 상세 조회로 이미 알고 있는 이 장소의 기존 이미지 key.
   * photoFile을 새로 고르지 않으면 제출 시 이 값을 그대로 재사용해 기존
   * 장소 사진이 지워지지 않게 한다.
   */
  existingImageKey?: string | null;
}

// VisitEvent.id를 만들 때 붙이는 접두사. place/event의 원본 id 풀이 서로
// 겹칠 수 있어(특히 실제 API로 교체되면 둘 다 숫자 id일 가능성), kind별로
// 접두사를 붙여 항상 유일하게 만든다. store의 visitOrder 정리 로직과
// buildAdminVisitEvents 양쪽에서 같은 접두사를 써야 하므로 여기서 공유한다.
export const VISIT_EVENT_PLACE_ID_PREFIX = 'place:';
export const VISIT_EVENT_CONTENT_ID_PREFIX = 'content:';
