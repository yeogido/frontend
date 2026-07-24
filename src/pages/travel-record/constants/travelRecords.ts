import boryeongFirstImage from '../assets/photos/boryeong-city.webp';
import boryeongSecondImage from '../assets/photos/boryeong-sky.webp';
import wandoFirstImage from '../assets/photos/wando-temple.webp';
import wandoSecondImage from '../assets/photos/wando-coast.webp';
import yeosuFirstImage from '../assets/photos/yeosu-lighthouse.webp';
import yeosuSecondImage from '../assets/photos/yeosu-sea.webp';

import type { TravelRecordFolder } from '../types';

export const TRAVEL_RECORD_FOLDERS: TravelRecordFolder[] = [
  {
    id: 'yeosu',
    regionCode: '4613',
    regionName: '\uC5EC\uC218\uC2DC',
    title: '\uC5EC\uC218\uC2DC',
    year: 2026,
    period: '11.25 - 11.30',
    photos: [yeosuFirstImage, yeosuSecondImage],
  },
  {
    id: 'wando',
    regionCode: '4689',
    regionName: '\uC644\uB3C4\uAD70',
    title: '\uC644\uB3C4\uAD70',
    year: 2026,
    period: '09.11 - 09.13',
    photos: [wandoFirstImage, wandoSecondImage],
  },
  {
    id: 'boryeong',
    regionCode: '4418',
    regionName: '\uBCF4\uB839\uAD70',
    title: '\uBCF4\uB839\uAD70',
    year: 2026,
    period: '05.14 - 05.16',
    photos: [boryeongFirstImage, boryeongSecondImage],
  },
];

export const TRAVEL_RECORD_YEARS = Array.from(
  new Set(TRAVEL_RECORD_FOLDERS.map((folder) => folder.year)),
).sort((currentYear, nextYear) => nextYear - currentYear);
