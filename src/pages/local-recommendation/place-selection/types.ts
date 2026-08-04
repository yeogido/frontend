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
}
