export interface AdminEventBasicInfo {
  placeName: string;
  placeIntro: string;
  startDate: string;
  endDate: string;
  phone: string;
  homepage: string;
}

export const createEmptyAdminEventBasicInfo = (): AdminEventBasicInfo => ({
  placeName: '',
  placeIntro: '',
  startDate: '',
  endDate: '',
  phone: '',
  homepage: '',
});

export interface AdminEventPhoto {
  file: File;
  previewUrl: string;
}

export const eventCategoryOptions = [
  { id: 'experience', label: '체험' },
  { id: 'exhibition', label: '전시' },
  { id: 'performance', label: '공연' },
  { id: 'festival', label: '축제' },
] as const;

export type EventCategoryId = (typeof eventCategoryOptions)[number]['id'];
