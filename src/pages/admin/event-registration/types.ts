import type { OfficialLink } from '../../../types/content.type';

export interface AdminEventBasicInfo {
  placeName: string;
  placeIntro: string;
  startDate: string;
  endDate: string;
  phone: string;
  /** 홈페이지·인스타그램 등 이미 설정된 링크를 전부 담는다 — 폼에 없는
   * 타입이 섞여 있어도(예: INSTAGRAM) 그대로 들고 있다가 그대로 돌려보내야
   * 화면에 안 보이는 링크가 저장할 때 조용히 지워지지 않는다. */
  officialLinks: OfficialLink[];
}

export const createEmptyAdminEventBasicInfo = (): AdminEventBasicInfo => ({
  placeName: '',
  placeIntro: '',
  startDate: '',
  endDate: '',
  phone: '',
  officialLinks: [],
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
  category: EventCategoryId
): (typeof eventCategoryOptions)[number]['apiValue'] =>
  eventCategoryOptions.find((option) => option.id === category)!.apiValue;

/** 수정 진입 시 상세 조회의 category(API 값)를 내부 EventCategoryId로 되돌린다. */
export const toEventCategoryId = (apiValue: string): EventCategoryId | null =>
  eventCategoryOptions.find((option) => option.apiValue === apiValue)?.id ??
  null;
