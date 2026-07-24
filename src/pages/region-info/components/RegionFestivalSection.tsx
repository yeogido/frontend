import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  SectionHeader,
} from '../../../components/common';

import { useGlobalScale } from '../../../hooks/useGlobalScale';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const CARD_GAP = 16;

interface RegionFestivalSectionProps {
  regionName: string;
}

function RegionFestivalSection({
  regionName,
}: RegionFestivalSectionProps) {
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
          title={`${regionName}에서 진행 중인 행사`}
          actionText="전체보기"
          onActionClick={() => navigate('/festival/search')}
        />
      </div>

      <div
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          paddingLeft: SECTION_PADDING_X * scale,
          paddingRight: SECTION_PADDING_X * scale,
        }}
      >
        <div className="overflow-x-auto pb-2">
          <div
            className="flex min-w-max"
            style={{ gap: CARD_GAP * scale }}
          >
            {isLoading ? (
              <>
                <ContentCardSkeleton />
                <ContentCardSkeleton />
              </>
            ) : (
              <>
                <ContentCard
                  image=""
                  title={`${regionName} 여름 축제`}
                  firstInfo="2026.07 ~ 2026.07"
                  secondInfo={`${regionName}`}
                  tags={['summer', 'experience', 'event']}
                />

                <ContentCard
                  image=""
                  title={`${regionName} 야시장 축제`}
                  firstInfo="2026.08 ~ 2026.08"
                  secondInfo={`${regionName}`}
                  liked
                  tags={['summer', 'restaurant', 'event']}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RegionFestivalSection;