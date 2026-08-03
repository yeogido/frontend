import { useNavigate } from 'react-router-dom';

import {
  PromotionCard,
  PromotionCardSkeleton,
  SectionHeader,
} from '../../../components/common';

import { useGlobalScale } from '../../../hooks/useGlobalScale';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;

interface RegionReviewSectionProps {
  regionName: string;
}

function RegionReviewSection({
  regionName,
}: RegionReviewSectionProps) {
  const isLoading = false;
  // const isLoading = true;

  const navigate = useNavigate();
  const scale = useGlobalScale();

  return (
    <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
      <div
        style={{
          paddingLeft: SECTION_PADDING_X * scale,
          paddingRight: SECTION_PADDING_X * scale,
        }}
      >
        <SectionHeader
          title={`${regionName}에서 이 곳은 어때요?`}
          actionText="전체보기"
          onActionClick={() => navigate('/local-business')}
        />
      </div>

      <div
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          paddingLeft: SECTION_PADDING_X * scale,
          paddingRight: SECTION_PADDING_X * scale,
        }}
      >
        {isLoading ? (
          <PromotionCardSkeleton />
        ) : (
          <PromotionCard
            avatarUrl="https://picsum.photos/40"
            profileName="부산 손흥민"
            date="2026.07.21"
            imageUrl="https://picsum.photos/342/266"
            title="웨이브온 카페"
            description="부산 바다를 한눈에 볼 수 있는 오션뷰 카페입니다. 일몰 시간에 방문하면 더욱 멋진 풍경을 볼 수 있어요."
            location={regionName}
            onClick={() => navigate('/review/search')} // 상세페이지 연동 시
          />
        )}
      </div>
    </section>
  );
}

export default RegionReviewSection;