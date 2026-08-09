export interface PlaceItem {
  id: string;
  title: string;
  address: string;
  imageSrc: string | null;
  externalPlaceId: string;
  categoryGroupCode: string;
  roadAddress: string;
  lotAddress: string;
  latitude: number;
  longitude: number;
}

export interface SelectedPlace extends PlaceItem {
  imageFile: File | null;
  imagePreviewUrl: string | null;
  /** 수정 진입 시 상세 조회로 알아낸 기존 이미지 key. 새로 안 고르면 재사용한다. */
  imageKey: string | null;
  /** 기존 이미지 key에 대응하는 URL — 새 파일을 안 고른 경우 미리보기로 쓴다. */
  imageUrl: string | null;
}
