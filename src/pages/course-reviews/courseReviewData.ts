import type { CourseReview } from '../detail/types/courseDetail';

const fallbackReviews: readonly CourseReview[] = [
  {
    id: 1,
    images: ['', '', ''],
    profileImage: '',
    nickname: '민지',
    meta: '20대 여',
    content:
      '지도 동선이 너무 편했어요. 전시 포인트마다 사진 각이 딱 잡혔고, 야경까지 흐름이 좋아서 만족!',
    rating: 5,
    isMine: true,
  },
  {
    id: 2,
    images: ['', '', ''],
    profileImage: '',
    nickname: '지우',
    meta: '20대 남',
    content:
      '처음으로 혼자 가는 여행이라 걱정했는데 추천 코스대로 다녀오니 정말 즐거웠습니다!',
    rating: 4,
  },
  {
    id: 3,
    images: ['', '', ''],
    profileImage: '',
    nickname: '서연',
    meta: '30대 여',
    content:
      '다음 여행에도 다시 참고하고 싶은 코스예요. 이동도 편하고 볼거리도 많았습니다.',
    rating: 5,
  },
];

export function getCourseReviewList(reviews: readonly CourseReview[]) {
  return reviews.length > 0 ? reviews : fallbackReviews;
}
