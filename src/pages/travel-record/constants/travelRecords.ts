import boryeongFirstImage from '../assets/photos/boryeong-city.webp';
import boryeongSecondImage from '../assets/photos/boryeong-sky.webp';
import busanFirstImage from '../assets/photos/busan1.webp';
import busanSecondImage from '../assets/photos/busan2.webp';
import busanThirdImage from '../assets/photos/busan3.webp';
import busanFourthImage from '../assets/photos/busan4.webp';
import busanFifthImage from '../assets/photos/busan5.webp';
import wandoFirstImage from '../assets/photos/wando-temple.webp';
import wandoSecondImage from '../assets/photos/wando-coast.webp';
import yeosuFirstImage from '../assets/photos/yeosu-lighthouse.webp';
import yeosuSecondImage from '../assets/photos/yeosu-sea.webp';

import type { TravelRecordFolder } from '../types';

export const TRAVEL_RECORD_FOLDERS: TravelRecordFolder[] = [
  {
    id: 'yeosu',
    regionCode: '4613',
    regionName: '여수시',
    title: '여수시',
    year: 2026,
    startDate: '2026-11-25',
    period: '11.25 - 11.30',
    photos: [yeosuFirstImage, yeosuSecondImage],
  },
  {
    id: 'wando',
    regionCode: '4689',
    regionName: '완도군',
    title: '완도군',
    year: 2026,
    startDate: '2026-09-11',
    period: '09.11 - 09.13',
    photos: [wandoFirstImage, wandoSecondImage],
  },
  {
    id: 'busan',
    regionCode: '2611',
    regionName: '부산시',
    title: '부산시',
    year: 2026,
    startDate: '2026-07-04',
    period: '07.04 - 07.06',
    photos: [
      busanFirstImage,
      busanSecondImage,
      busanThirdImage,
      busanFourthImage,
      busanFifthImage,
    ],
  },
  {
    id: 'boryeong',
    regionCode: '4418',
    regionName: '보령군',
    title: '보령군',
    year: 2026,
    startDate: '2026-05-14',
    period: '05.14 - 05.16',
    photos: [boryeongFirstImage, boryeongSecondImage],
  },
];

export const TRAVEL_RECORD_YEARS = Array.from(
  new Set(TRAVEL_RECORD_FOLDERS.map((folder) => folder.year))
).sort((currentYear, nextYear) => nextYear - currentYear);

export type TravelRecordView = 'folder' | 'map';