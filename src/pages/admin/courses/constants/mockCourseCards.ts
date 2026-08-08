import { courseImage } from '../../../detail/constants/courseDetailMock';
import type { TagId } from '../../../../types/tag.type';

export interface MockCourseCard {
  id: string;
  image: string;
  title: string;
  duration: string;
  courseType: string;
  companion: string;
  tags: TagId[];
}

export interface MockPopularContentCard {
  id: string;
  image: string;
  title: string;
  firstInfo: string;
  secondInfo: string;
  tags: TagId[];
}

// UI만 구현하는 화면이라 실제 코스 목록 API 대신 정적 목록을 쓴다.
// (yeogido-course 홈 화면과 같은 구조를 그대로 재사용한다 — 히어로 배너,
// "인기 추천 코스" 가로 스크롤(ContentCard), "최근 본 코스" 세로 목록(CourseCard).)
export const mockHeroCourse = {
  title: '부산 광안리 맛집 & 카페 코스',
  description: '광안리에서 식사와 디저트를 함께 즐기는 코스입니다.',
  durationLabel: '당일치기',
  transportLabel: '드라이브 코스',
  thumbnailUrl: courseImage,
};

export const mockPopularCourseCards: MockPopularContentCard[] = [
  {
    id: 'course-1',
    image: courseImage,
    title: '부산 광안리 맛집 & 카페 코스',
    firstInfo: '당일치기',
    secondInfo: '수영구',
    tags: ['spring', 'autumn'],
  },
  {
    id: 'course-2',
    image: courseImage,
    title: '부산 광안리 바다 먹거리 코스',
    firstInfo: '당일치기',
    secondInfo: '수영구',
    tags: ['summer', 'winter'],
  },
];

export const mockRecentCourseCards: MockCourseCard[] = [
  {
    id: 'course-3',
    image: courseImage,
    title: '전주 한옥마을 나들이 코스',
    duration: '당일치기',
    courseType: '뚜벅이 코스',
    companion: '가족과',
    tags: ['experience', 'restaurant'],
  },
  {
    id: 'course-4',
    image: courseImage,
    title: '제주 자연 힐링 코스',
    duration: '2박 3일',
    courseType: '자동차 코스',
    companion: '친구와',
    tags: ['nature', 'mountain'],
  },
];
