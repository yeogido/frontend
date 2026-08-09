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
  /**
   * 수정 진입 시 기존 사진을 "미리보기만" 보여줄 때는 file이 없다(실제
   * File 객체를 만들 수 없어서). 새로 고르면 실제 File이 들어온다.
   */
  file: File | null;
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

/** 수정 진입 시 상세 조회의 category(API 값)를 내부 EventCategoryId로 되돌린다. */
export const toEventCategoryId = (
  apiValue: string,
): EventCategoryId | null =>
  eventCategoryOptions.find((option) => option.apiValue === apiValue)?.id ??
  null;
