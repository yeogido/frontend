import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  SectionHeader,
} from '../../../components/common';
import { useOngoingContents } from '../../../hooks/useOngoingContents';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { buildFestivalDetailPath } from '../../../utils/routes';
import { toContentTagIds } from '../../../utils/contentTags';

const PREVIEW_ITEM_COUNT = 2;

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const CARD_GAP = 16;

function FestivalSection() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useContentLikeToggle();
  const { data: ongoingContents, isPending: isLoading } = useOngoingContents();
  const festivals = (ongoingContents ?? []).slice(0, PREVIEW_ITEM_COUNT);

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
          onActionClick={() => navigate('/festival/')}
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
                  liked={getLiked(festival.contentId, false)}
                  onClick={() =>
                    navigate(buildFestivalDetailPath(festival.contentId))
                  }
                  onLikeClick={() =>
                    toggleLike(
                      festival.contentId,
                      getLiked(festival.contentId, false)
                    )
                  }
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
