import courseMapImage from '../assets/courseimage.svg';

export const yeogidoCoursePopularPreviews = [
  {
    id: 1,
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseName: '뚜벅이 코스',
  },
  {
    id: 2,
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseName: '뚜벅이 코스',
  },
];

export const yeogidoCourseRecentPreviews = Array.from(
  { length: 3 },
  (_, index) => ({
    id: index + 1,
    image: courseMapImage,
    title: '강릉 혼자 여행 코스',
    description: '바다를 따라 걷고, 감성 가득한 코스를 둘러보세요.',
    duration: '2박 3일',
    courseType: '뚜벅이 코스',
    liked: index === 0,
  })
);
