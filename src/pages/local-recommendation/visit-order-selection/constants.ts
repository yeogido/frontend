import eventThumbnail from './assets/event-thumbnail.png';

export interface VisitEvent {
  id: string;
  name: string;
  address: string;
  imageSrc: string;
}

export const initialVisitEvents: VisitEvent[] = [
  {
    id: 'gwangalli-beach',
    name: '광안리해수욕장',
    address: '부산 수영구 광안해변로 219',
    imageSrc: eventThumbnail,
  },
  {
    id: 'gamcheon-culture-village',
    name: '감천문화마을',
    address: '부산 사하구 감내2로 203',
    imageSrc: eventThumbnail,
  },
  {
    id: 'haeundae-blueline-park',
    name: '해운대 블루라인파크',
    address: '부산 해운대구 청사포로 116',
    imageSrc: eventThumbnail,
  },
  {
    id: 'busan-x-the-sky',
    name: '부산엑스더스카이',
    address: '부산 해운대구 달맞이길 30',
    imageSrc: eventThumbnail,
  },
  {
    id: 'the-bay-101',
    name: '더베이101',
    address: '부산 해운대구 동백로 52',
    imageSrc: eventThumbnail,
  },
  {
    id: 'busan-cinema-center',
    name: '영화의전당',
    address: '부산 해운대구 수영강변대로 120',
    imageSrc: eventThumbnail,
  },
];
