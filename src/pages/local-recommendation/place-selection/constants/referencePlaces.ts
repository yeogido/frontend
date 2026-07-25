import type { PlaceItem } from '../types';

const placeImageRegistry: Readonly<Record<string, string>> = {
  'gwangalli-beach': new URL(
    '../../event-selection/assets/gwangalli-beach.png',
    import.meta.url
  ).href,
};

export const referencePlaces = [
  {
    id: 'gwangalli-beach',
    title: '광안리해수욕장',
    address: '부산광역시 수영구 광안해변로 219',
    imageSrc: placeImageRegistry['gwangalli-beach'],
  },
  {
    id: 'haeundae-beach',
    title: '해운대해수욕장',
    address: '부산광역시 해운대구 해운대해변로 264',
    imageSrc: null,
  },
  {
    id: 'gamcheon-culture-village',
    title: '감천문화마을',
    address: '부산광역시 사하구 감내2로 203',
    imageSrc: null,
  },
] as const satisfies readonly PlaceItem[];
