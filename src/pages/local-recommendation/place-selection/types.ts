export interface PlaceItem {
  id: string;
  title: string;
  address: string;
  imageSrc: string | null;
}

export interface SelectedPlace extends PlaceItem {
  imageFile: File;
  imagePreviewUrl: string;
}
