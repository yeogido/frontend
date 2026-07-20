import courseMapImage from '../assets/courseimage.svg';

import { defaultCardTagIds } from '../../../constants/tags';

export const yeogidoCoursePopularPreviews = [
  {
    id: 1,
    image: courseMapImage,
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseType: '뚜벅이 코스',
    companion: '혼자',
    tags: defaultCardTagIds,
    liked: false,
  },
  {
    id: 2,
    image: courseMapImage,
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseType: '뚜벅이 코스',
    companion: '혼자',
    tags: defaultCardTagIds,
    liked: false,
  },
];

export const yeogidoCourseRecentPreviews = Array.from(
  { length: 2 },
  (_, index) => ({
    id: index + 1,
    image: courseMapImage,
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseType: '뚜벅이 코스',
    companion: '혼자',
    tags: defaultCardTagIds,
    liked: index === 0,
  })
);
