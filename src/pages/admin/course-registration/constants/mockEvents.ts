import type { AdminCourseEventItem } from '../types';

// UI만 구현하는 화면이라 실제 행사 검색 API 대신 정적 목록을 쓴다.
export const mockCourseEvents: AdminCourseEventItem[] = [
  {
    id: 'event-1',
    title: '광안리 M드론라이트쇼',
    address: '부산 수영구 광안해변로 219',
    imageSrc: null,
  },
  {
    id: 'event-2',
    title: '해운대 빛축제',
    address: '부산 해운대구 해운대해변로 264',
    imageSrc: null,
  },
  {
    id: 'event-3',
    title: '감천문화마을 야시장',
    address: '부산 사하구 감내2로 203',
    imageSrc: null,
  },
  {
    id: 'event-4',
    title: '태종대 벚꽃축제',
    address: '부산 영도구 전망로 24',
    imageSrc: null,
  },
  {
    id: 'event-5',
    title: '송정 서핑 페스티벌',
    address: '부산 해운대구 송정해변로 62',
    imageSrc: null,
  },
];

export function searchMockCourseEvents(
  keyword: string
): AdminCourseEventItem[] {
  const trimmed = keyword.trim();

  if (!trimmed) {
    return mockCourseEvents;
  }

  return mockCourseEvents.filter(
    (event) =>
      event.title.includes(trimmed) || event.address.includes(trimmed)
  );
}
