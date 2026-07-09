import {
  CourseCard,
  CourseCardSkeleton,
  SectionHeader,
} from '../../../components/common';

function CourseSection() {
  const isLoading = false; // UI 확인용
  // const isLoading = true; // Skeleton 확인용

  return (
    <section className="mt-8">
      <div className="px-6">
        <SectionHeader
          title="여기도 추천 코스"
          actionText="전체보기"
        />
      </div>

      <div className="mt-4 flex flex-col gap-4 px-6">
        {isLoading ? (
          <>
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </>
        ) : (
          <>
            <CourseCard
              image=""
              title="강릉 혼자 여행 코스"
              description="바다를 따라 걷고, 감성 가득한 카페와 로컬 맛집을 즐겨보세요."
              duration="2박 3일"
              courseType="뚜벅이 코스"
            />

            <CourseCard
              image=""
              title="제주 힐링 여행 코스"
              description="푸른 바다와 오름을 따라 여유로운 제주 여행을 즐겨보세요."
              duration="3박 4일"
              courseType="드라이브 코스"
              liked
            />
          </>
        )}
      </div>
    </section>
  );
}

export default CourseSection;