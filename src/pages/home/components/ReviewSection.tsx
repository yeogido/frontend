import {
  ReviewCard,
  ReviewCardSkeleton,
  SectionHeader,
} from '../../../components/common';

const reviews = [
  {
    id: 1,
    profileImage: '',
    nickname: '민지',
    meta: '20대 여',
    content:
      '혼자 떠난 강릉 여행이었는데 바다도 예쁘고 코스도 알차서 정말 만족스러웠어요.',
    rating: 5,
  },
  {
    id: 2,
    profileImage: '',
    nickname: '준호',
    meta: '30대 남',
    content:
      '맛집과 카페 동선이 잘 짜여 있어서 하루 동안 편하게 여행했습니다.',
    rating: 5,
  },
  {
    id: 3,
    profileImage: '',
    nickname: '수진',
    meta: '20대 여',
    content:
      '사진 찍기 좋은 장소가 많고 코스가 자연스럽게 이어져서 즐거운 여행이었어요.',
    rating: 5,
  },
];

function ReviewSection() {
  const isLoading = false;
  // const isLoading = true;

  return (
    <section className="mt-8 flex flex-col gap-3 px-6">
      <SectionHeader
        title="최근 여행자들의 후기"
        actionText="전체보기"
      />

      <div
        className="
          flex
          gap-4
          overflow-x-auto
          scrollbar-hide
        "
      >
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <ReviewCardSkeleton key={index} />
            ))
          : reviews.map((review) => (
              <ReviewCard
                key={review.id}
                profileImage={review.profileImage}
                nickname={review.nickname}
                meta={review.meta}
                content={review.content}
                rating={review.rating}
              />
            ))}
      </div>
    </section>
  );
}

export default ReviewSection;