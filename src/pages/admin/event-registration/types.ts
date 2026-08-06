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
  { id: 'experience', label: '체험', apiValue: 'EXPERIENCE' },
  { id: 'exhibition', label: '전시', apiValue: 'EXHIBITION' },
  { id: 'performance', label: '공연', apiValue: 'PERFORMANCE' },
  { id: 'festival', label: '축제', apiValue: 'FESTIVAL' },
] as const;

export type EventCategoryId = (typeof eventCategoryOptions)[number]['id'];

export const toContentCategory = (
  category: EventCategoryId,
): (typeof eventCategoryOptions)[number]['apiValue'] =>
  eventCategoryOptions.find((option) => option.id === category)!.apiValue;
