import busanPhoto from '../assets/images/regions/busan.webp';
import jeonnamPhoto from '../assets/images/regions/jeonnam.webp';
import chungnamPhoto from '../assets/images/regions/chungnam.webp';
import type {
  TravelRecordFolder,
} from '../pages/travel-record/types';

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
