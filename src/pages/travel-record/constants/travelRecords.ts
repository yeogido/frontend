import { regionCityImages } from '../../../constants/regionImages';

import type { TravelRecordFolder } from '../types';

export const TRAVEL_RECORD_FOLDERS: TravelRecordFolder[] = [
  {
    id: 'yeosu',
    regionCode: '4613',
    regionName: '여수시',
    title: '여수시',
    year: 2026,
    period: '11.25 - 11.30',
    photos: [regionCityImages.busan, regionCityImages.gyeongnam],
  },
  {
    id: 'wando',
    regionCode: '4689',
    regionName: '완도군',
    title: '완도군',
    year: 2026,
    period: '09.11 - 09.13',
    photos: [regionCityImages.jeonnam, regionCityImages.jeju],
  },
  {
    id: 'boryeong',
    regionCode: '4418',
    regionName: '보령시',
    title: '보령시',
    year: 2026,
    period: '05.14 - 05.16',
    photos: [regionCityImages.chungnam, regionCityImages.daejeon],
  },
];

export const TRAVEL_RECORD_YEARS = Array.from(
  new Set(TRAVEL_RECORD_FOLDERS.map((folder) => folder.year)),
).sort((currentYear, nextYear) => nextYear - currentYear);
