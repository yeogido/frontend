import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  SectionHeader,
} from '../../../components/common';
import { useCultureContents } from '../../../hooks/useCultureContents';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useAuthStore } from '../../../store/auth.store';
import { buildFestivalDetailPath } from '../../../utils/routes';
import { toContentTagIds } from '../../../utils/contentTags';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const CARD_GAP = 16;

function FestivalSection() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const [likedContentIds, setLikedContentIds] = useState<number[]>([]);
  const {
    data: cultureContents,
    isPending: isLoading,
  } = useCultureContents({
    category: 'FESTIVAL',
    sort: 'RECOMMEND',
    size: 2,
  });
  const festivals = cultureContents?.pages[0]?.items ?? [];

  const handleLikeClick = (contentId: number) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    setLikedContentIds((previousIds) =>
      previousIds.includes(contentId)
        ? previousIds.filter((id) => id !== contentId)
        : [...previousIds, contentId],
    );

    // TODO: 좋아요 API 연동
  };

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
          onActionClick={() => navigate('/festival/ongoing')}
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
              festivals.map((festival) => (
                <ContentCard
                  key={festival.contentId}
                  image={festival.thumbnailImageUrl}
                  title={festival.title}
                  firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
                  secondInfo={festival.regionName}
                  tags={toContentTagIds(festival.hashtags)}
                  liked={
                    isLoggedIn &&
                    likedContentIds.includes(festival.contentId)
                  }
                  onClick={() =>
                    navigate(buildFestivalDetailPath(festival.contentId))
                  }
                  onLikeClick={() => handleLikeClick(festival.contentId)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FestivalSection;
