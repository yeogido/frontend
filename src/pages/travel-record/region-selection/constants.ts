import { regionCityImages } from '../../../constants/regionImages';

import type { TravelRecordRegion } from './types';

export const MAX_VISIBLE_REGION_SUGGESTIONS = 4;

export const recentSearchStorageOptions = {
  storageKey: 'travel-record-region:recent-searches',
  fallbackSearches: ['전주', '부산', '강릉', '제주도'],
};

export const popularRegions: readonly TravelRecordRegion[] = [
  {
    id: 'jeonju',
    name: '전주',
    province: '전라북도',
    selectionName: '전주시',
    imageSrc: regionCityImages.jeonbuk,
  },
  {
    id: 'busan',
    name: '부산',
    province: '부산광역시',
    selectionName: '부산광역시',
    imageSrc: regionCityImages.busan,
  },
  {
    id: 'jeju',
    name: '제주도',
    province: '제주특별자치도',
    selectionName: '제주특별자치도',
    imageSrc: regionCityImages.jeju,
  },
  {
    id: 'gangneung',
    name: '강릉',
    province: '강원특별자치도',
    selectionName: '강릉시',
    imageSrc: regionCityImages.gangwon,
  },
  {
    id: 'seoul',
    name: '서울',
    province: '서울특별시',
    selectionName: '서울특별시',
    imageSrc: regionCityImages.seoul,
  },
  {
    id: 'gyeongju',
    name: '경주',
    province: '경상북도',
    selectionName: '경주시',
    imageSrc: regionCityImages.gyeongbuk,
  },
];

export const searchSuggestions = [
  '부산광역시',
  '부여군',
  '보령시',
  '보성군',
  '전주시',
  '강릉시',
  '제주특별자치도',
  '서울특별시',
  '경주시',
];

export const normalizeSearchText = (text: string) => text.replace(/\s/g, '');

export const getRegionSearchText = (region: TravelRecordRegion) =>
  normalizeSearchText(`${region.name}${region.province}${region.selectionName}`);

export const findRegionByName = (regionName: string) =>
  popularRegions.find(
    (region) =>
      region.name === regionName ||
      region.province === regionName ||
      region.selectionName === regionName,
  ) ?? null;

export const createSelectedRegionFromSuggestion = (
  regionName: string,
): TravelRecordRegion => ({
  id: `suggestion-${normalizeSearchText(regionName)}`,
  name: regionName,
  province: regionName,
  selectionName: regionName,
  imageSrc: '',
});
