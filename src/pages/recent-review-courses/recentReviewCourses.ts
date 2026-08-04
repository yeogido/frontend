import type { CourseReviewCardProps } from '../../components/common/CourseReviewCard';

export interface RecentReviewCourse extends CourseReviewCardProps {
  id: string;
}

export const recentReviewCourses: RecentReviewCourse[] = [
  {
    id: 'mukho-solo-trip',
    image: '',
    title: '묵호 혼자 여행 코스',
    duration: '2박 3일',
    courseType: '뚜벅이',
    companion: '혼자',
    tags: ['summer', 'nature', 'sea'],
    profileImage: '',
    nickname: '민지',
    meta: '20대 여',
    content:
      '지도 동선이 너무 편했어요. 전시 포인트마다 사진 각이 딱 잡혔고, 야경까지 흐름이 좋아서 만족!',
    rating: 5,
    liked: false,
  },
  {
    id: 'jeonju-food-trip',
    image: '',
    title: '전주 맛집 산책 코스',
    duration: '1박 2일',
    courseType: '뚜벅이',
    companion: '친구',
    tags: ['restaurant', 'cafe', 'experience'],
    profileImage: '',
    nickname: '지우',
    meta: '20대 남',
    content: '골목마다 들를 곳이 많아서 하루가 정말 알찼어요. 다음에도 또 가고 싶어요!',
    rating: 5,
    liked: false,
  },
  {
    id: 'jeju-sea-trip',
    image: '',
    title: '제주 바다 힐링 코스',
    duration: '2박 3일',
    courseType: '렌터카',
    companion: '연인',
    tags: ['sea', 'nature', 'summer'],
    profileImage: '',
    nickname: '서연',
    meta: '30대 여',
    content: '바다 풍경이 정말 좋았고 이동 동선도 여유로워서 편하게 여행했어요.',
    rating: 5,
    liked: false,
  },
  {
    id: 'gangneung-cafe-trip',
    image: '',
    title: '강릉 감성 카페 코스',
    duration: '1박 2일',
    courseType: '뚜벅이',
    companion: '혼자',
    tags: ['cafe', 'sea', 'summer'],
    profileImage: '',
    nickname: '현우',
    meta: '20대 남',
    content: '사진 찍기 좋은 곳이 많고 카페마다 분위기가 달라서 즐거웠습니다.',
    rating: 5,
    liked: false,
  },
];
