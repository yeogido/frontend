import busanImage from '../assets/busan.svg';
import gangneungImage from '../assets/gangneung.svg';
import jejuImage from '../assets/jeju.svg';
import seoulImage from '../assets/seoul.svg';
import type { PopularRegion } from '../types';

export const recentNeighborhoodIds = [7, 1, 6];

export const popularRegions: PopularRegion[] = [
  { neighborhoodId: 1, image: seoulImage, imageAlt: '서울 연남동 풍경' },
  { neighborhoodId: 4, image: busanImage, imageAlt: '부산 해운대 풍경' },
  { neighborhoodId: 6, image: gangneungImage, imageAlt: '강릉 풍경' },
  { neighborhoodId: 7, image: jejuImage, imageAlt: '제주 애월 풍경' },
];
