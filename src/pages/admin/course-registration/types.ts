import type { PlaceItem } from '../../local-recommendation/place-selection/types';

export interface AdminCoursePhoto {
  file: File;
  previewUrl: string;
}

export interface AdminCourseEventItem {
  id: string;
  title: string;
  address: string;
  imageSrc: string | null;
}

export interface AdminCoursePlaceItem extends PlaceItem {
  photoFile: File | null;
  photoPreviewUrl: string | null;
}

// VisitEvent.id를 만들 때 붙이는 접두사. place/event의 원본 id 풀이 서로
// 겹칠 수 있어(특히 실제 API로 교체되면 둘 다 숫자 id일 가능성), kind별로
// 접두사를 붙여 항상 유일하게 만든다. store의 visitOrder 정리 로직과
// buildAdminVisitEvents 양쪽에서 같은 접두사를 써야 하므로 여기서 공유한다.
export const VISIT_EVENT_PLACE_ID_PREFIX = 'place:';
export const VISIT_EVENT_CONTENT_ID_PREFIX = 'content:';
