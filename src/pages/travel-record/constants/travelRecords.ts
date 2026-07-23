import boryeongFirstImage from '../../course-region-search/assets/cities/chungnam.webp';
import boryeongSecondImage from '../../course-region-search/assets/cities/daejeon.webp';
import wandoFirstImage from '../../course-region-search/assets/cities/jeonnam.webp';
import wandoSecondImage from '../../course-region-search/assets/cities/jeju.webp';
import yeosuFirstImage from '../../course-region-search/assets/cities/busan.webp';
import yeosuSecondImage from '../../course-region-search/assets/cities/gyeongnam.webp';

import type { TravelRecordFolder } from '../types';

export const TRAVEL_RECORD_FOLDERS: TravelRecordFolder[] = [
  {
    id: 'yeosu',
    regionCode: '4613',
    regionName: '여수시',
    title: '여수시',
    year: 2026,
    period: '11.25 - 11.30',
    photos: [yeosuFirstImage, yeosuSecondImage],
  },
  {
    id: 'wando',
    regionCode: '4689',
    regionName: '완도군',
    title: '완도군',
    year: 2026,
    period: '09.11 - 09.13',
    photos: [wandoFirstImage, wandoSecondImage],
  },
  {
    id: 'boryeong',
    regionCode: '4418',
    regionName: '보령시',
    title: '보령시',
    year: 2026,
    period: '05.14 - 05.16',
    photos: [boryeongFirstImage, boryeongSecondImage],
  },
];

export const TRAVEL_RECORD_YEARS = Array.from(
  new Set(TRAVEL_RECORD_FOLDERS.map((folder) => folder.year)),
).sort((currentYear, nextYear) => nextYear - currentYear);
