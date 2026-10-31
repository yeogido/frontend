import busanPhoto from '../assets/images/regions/busan.webp';
import jeonnamPhoto from '../assets/images/regions/jeonnam.webp';
import chungnamPhoto from '../assets/images/regions/chungnam.webp';
import type {
  TravelRecordFolder,
  TravelRecordInvitation,
} from '../pages/travel-record/types';

/** 초대 API 연동 전 목록·수락·거절 UI 확인용. 새로고침하면 초기화된다. */
export const mockTravelRecordInvitations: TravelRecordInvitation[] = [
  {
    id: 'preview-invitation-1',
    inviterName: '서희연',
    inviterColor: 'orange',
    folder: {
      id: 'preview-shared-yeosu',
      regionCode: '',
      regionName: '여수시',
      title: '여수시',
      startDate: '2026-11-25',
      endDate: '2026-11-27',
      period: '11.25 - 11.27',
      photos: [jeonnamPhoto],
      decorations: [],
      visibility: 'friends',
    },
  },
];

export const mockSharedTravelRecordFolders: TravelRecordFolder[] = [
  {
    id: 'preview-shared-boryeong',
    regionCode: '',
    regionName: '보령군',
    title: '보령군',
    startDate: '2026-05-14',
    endDate: '2026-05-16',
    period: '05.14 - 05.16',
    photos: [chungnamPhoto],
    decorations: [],
    visibility: 'friends',
  },
  {
    id: 'preview-shared-busan',
    regionCode: '',
    regionName: '부산시',
    title: '부산시',
    startDate: '2026-08-21',
    endDate: '2026-08-22',
    period: '08.21 - 08.22',
    photos: [busanPhoto, jeonnamPhoto],
    decorations: [],
    visibility: 'friends',
  },
];
