import courseMapImage from '../pages/yeogido-course/assets/courseimage.svg';

import type { LocalCourse } from '../types/localCourse.type';
import { defaultCardTagIds } from './tags';

export const localCoursePopularPreviews: LocalCourse[] = [
  {
    id: 1,
    image: courseMapImage,
    title: '성수 로컬 산책 코스',
    duration: '당일치기',
    courseType: '뚜벅이 코스',
    companion: '친구와',
    tags: defaultCardTagIds,
    liked: false,
  },
  {
    id: 2,
    image: courseMapImage,
    title: '망원시장 맛집 코스',
    duration: '2박 3일',
    courseType: '뚜벅이 코스',
    companion: '혼자',
    tags: ['restaurant', 'cafe', 'local-attraction'],
    liked: true,
  },
  {
    id: 5,
    image: courseMapImage,
    title: '을지로 노포 탐방 코스',
    duration: '당일치기',
    courseType: '뚜벅이 코스',
    companion: '친구와',
    tags: ['restaurant', 'local-attraction', 'event'],
    liked: false,
  },
  {
    id: 6,
    image: courseMapImage,
    title: '제주 구좌 마을 코스',
    duration: '1박 2일',
    courseType: '드라이브 코스',
    companion: '가족과',
    tags: ['sea', 'nature', 'cafe'],
    liked: false,
  },
  {
    id: 7,
    image: courseMapImage,
    title: '전주 한옥마을 골목 코스',
    duration: '당일치기',
    courseType: '뚜벅이 코스',
    companion: '연인과',
    tags: ['local-attraction', 'restaurant', 'cafe'],
    liked: true,
  },
  {
    id: 8,
    image: courseMapImage,
    title: '강릉 주문진 바다 코스',
    duration: '2박 3일',
    courseType: '뚜벅이 코스',
    companion: '혼자',
    tags: ['sea', 'bakery', 'nature'],
    liked: false,
  },
];

export const localCourseRecentPreviews: LocalCourse[] = [
  {
    id: 3,
    image: courseMapImage,
    title: '연남동 골목 여행 코스',
    duration: '당일치기',
    courseType: '뚜벅이 코스',
    companion: '연인과',
    tags: ['cafe', 'restaurant', 'local-attraction'],
    liked: false,
  },
  {
    id: 4,
    image: courseMapImage,
    title: '부산 영도 로컬 코스',
    duration: '1박 2일',
    courseType: '대중교통 코스',
    companion: '가족과',
    tags: ['sea', 'nature', 'local-attraction'],
    liked: false,
  },
];
