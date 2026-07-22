import {
  ContentCard,
  ContentCardSkeleton,
  SectionHeader,
} from '../../../components/common';
import { useNavigate } from 'react-router-dom';

import { useGlobalScale } from '../../../hooks/useGlobalScale';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const CARD_GAP = 16;

function FestivalSection() {
  const isLoading = false;
  // const isLoading = true; // 스켈레톤 확인용

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
          title="진행 중인 행사"
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
      </div>
    </section>
  );
}

export default FestivalSection;