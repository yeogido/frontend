import { useNavigate } from 'react-router-dom';

import {
  ContentCardSkeleton,
  FestivalContentCard,
  FestivalDeleteDialog,
  SectionHeader,
} from '../../../components/common';
import { useContentDelete } from '../../../hooks/useContentDelete';
import { useCultureContents } from '../../../hooks/useCultureContents';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useEditFestival } from '../../../hooks/useEditFestival';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useIsAdmin } from '../../../hooks/useMyProfile';
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
  const isAdmin = useIsAdmin();
  const { editFestival } = useEditFestival();
  const { requestDelete, dialogProps } = useContentDelete();
  const { data, isPending: isLoading } = useCultureContents({
    statuses: ['ONGOING'],
    sort: 'RECOMMEND',
    size: PREVIEW_ITEM_COUNT,
  });
  const festivals = data?.pages[0]?.items ?? [];

  return (
    <>
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
            <div className="flex min-w-max" style={{ gap: CARD_GAP * scale }}>
              {isLoading ? (
                <>
                  <ContentCardSkeleton />
                  <ContentCardSkeleton />
                </>
              ) : (
                festivals.map((festival) => (
                  <FestivalContentCard
                    key={festival.contentId}
                    image={festival.thumbnailImageUrl}
                    title={festival.title}
                    startDate={festival.startDate}
                    endDate={festival.endDate}
                    regionName={festival.regionName}
                    tags={toContentTagIds(festival.hashtags)}
                    isAdmin={isAdmin}
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
                    onEdit={() => void editFestival(festival.contentId)}
                    onDelete={() => requestDelete(festival.contentId)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
      <FestivalDeleteDialog {...dialogProps} />
    </>
  );
}

export default FestivalSection;
