import courseMapImage from '../assets/courseimage.svg';

import type { TagType } from '../../../components/common/TagChip';

const defaultTags: TagType[] = ['sea', 'nature', 'summer'];

export const yeogidoCoursePopularPreviews = [
  {
    id: 1,
    image: courseMapImage,
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseType: '뚜벅이 코스',
    companion: '혼자',
    tags: defaultTags,
    liked: false,
  },
  {
    id: 2,
    image: courseMapImage,
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseType: '뚜벅이 코스',
    companion: '혼자',
    tags: defaultTags,
    liked: false,
  },
];

export const yeogidoCourseRecentPreviews = Array.from(
  { length: 3 },
  (_, index) => ({
    id: index + 1,
    image: courseMapImage,
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseType: '뚜벅이 코스',
    companion: '혼자',
    tags: defaultTags,
    liked: index === 0,
  })
);