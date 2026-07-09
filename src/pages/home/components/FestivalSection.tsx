import {
  ContentCard,
  ContentCardSkeleton,
  SectionHeader,
} from '../../../components/common';

function FestivalSection() {
  const isLoading = false; // UI 확인용
  //const isLoading = true; // Skeleton 확인용

  return (
    <section className="mt-8">
      <div className="px-6">
        <SectionHeader
          title="진행 중인 행사"
          actionText="전체보기"
        />
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto px-6">
        {isLoading ? (
          <>
            <ContentCardSkeleton />
            <ContentCardSkeleton />
          </>
        ) : (
          <>
            <ContentCard
              image=""
              title="양평수박축제"
              firstInfo="2026.07 ~ 2026.07"
              secondInfo="경기도 양평군"
            />

            <ContentCard
              image=""
              title="양평수박축제"
              firstInfo="2026.07 ~ 2026.07"
              secondInfo="경기도 양평군"
              liked
            />
          </>
        )}
      </div>
    </section>
  );
}

export default FestivalSection;