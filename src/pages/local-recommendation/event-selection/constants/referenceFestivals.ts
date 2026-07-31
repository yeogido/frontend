import type { FestivalApiItem } from '../types';

export const referenceFestivalRecords = [
  {
    id: 'gwangalli-beach-01',
    contentId: 1,
    tag: '광안리해수욕장',
    title: '광안리해수욕장',
    address: '부산 수영구 광안해변로 219',
  },
  {
    id: 'busan-fireworks-01',
    contentId: 2,
    tag: '부산불꽃축제',
    title: '부산불꽃축제',
    address: '부산 수영구 광안해변로 219',
  },
  {
    id: 'haeundae-sand-01',
    contentId: 3,
    tag: '해운대 모래축제',
    title: '해운대 모래축제',
    address: '부산 해운대구 해운대해변로 264',
  },
] as const satisfies readonly FestivalApiItem[];
