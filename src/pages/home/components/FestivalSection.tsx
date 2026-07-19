import {
  ContentCard,
  ContentCardSkeleton,
  SectionHeader,
} from '../../../components/common';
import { useNavigate } from 'react-router-dom';

function FestivalSection() {
  const isLoading = false;
  // const isLoading = true;

  const navigate = useNavigate();

  return (
    <section className="mt-8">
      <div className="px-6">
        <SectionHeader
          title="진행 중인 행사"
          actionText="전체보기"
          onActionClick={() => navigate('/festival/search')}
        />
      </div>

      <div className="mt-4 px-6">
        <div className="flex justify-between gap-4 overflow-x-auto pb-2">
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
                tags={['summer', 'nature', 'experience']}
              />

              <ContentCard
                image=""
                title="양평수박축제"
                firstInfo="2026.07 ~ 2026.07"
                secondInfo="경기도 양평군"
                liked
                tags={['summer', 'bakery', 'experience']}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default FestivalSection;
