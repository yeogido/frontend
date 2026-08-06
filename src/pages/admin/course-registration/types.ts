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
