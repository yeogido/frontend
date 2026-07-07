import { ContentCard, SectionHeader } from '../../../components/common';

function FestivalSection() {
  return (
    <section className="mt-8">
      <div className="px-6">
        <SectionHeader
          title="진행 중인 행사"
          actionText="전체보기"
        />
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto px-6">
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
      </div>
    </section>
  );
}

export default FestivalSection;