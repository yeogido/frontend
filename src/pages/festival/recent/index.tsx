import { useNavigate } from 'react-router-dom';

import {
  FestivalContentCard,
  FestivalDeleteDialog,
} from '../../../components/common';
import { useContentDelete } from '../../../hooks/useContentDelete';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useEditFestival } from '../../../hooks/useEditFestival';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useRecentCultureContents } from '../../../hooks/useRecentCultureContents';
import { useRecentCultureContentPermissions } from '../../../hooks/useRecentCultureContentPermissions';
import { toContentTagIds } from '../../../utils/contentTags';
import { buildFestivalDetailPath } from '../../../utils/routes';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 21;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const MESSAGE_TEXT_SIZE = 13;

function FestivalRecentPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useContentLikeToggle();
  const { editFestival } = useEditFestival();
  const { requestDelete, dialogProps } = useContentDelete();
  const recentFestivals = useRecentCultureContents();
  const canManageByContentId = useRecentCultureContentPermissions(
    recentFestivals.map((festival) => festival.contentId)
  );

  return (
    <>
      <section
        className="mx-auto flex min-h-screen w-full flex-col"
        style={{
          paddingLeft: PAGE_PADDING_X * scale,
          paddingRight: PAGE_PADDING_X * scale,
          paddingTop: PAGE_PADDING_TOP * scale,
          paddingBottom: PAGE_PADDING_BOTTOM * scale,
        }}
      >
        <div>
          <h1
            className="font-semibold text-black"
            style={{
              fontSize: TITLE_SIZE * scale,
              lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
            }}
          >
            최근 본 행사
          </h1>
          <p
            className="text-gray-5 font-normal"
            style={{
              marginTop: DESCRIPTION_MARGIN_TOP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
              lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
            }}
          >
            최근 확인한 행사를 다시 살펴보세요.
          </p>
        </div>

        {recentFestivals.length > 0 ? (
          <div
            className="grid grid-cols-2"
            style={{
              marginTop: LIST_MARGIN_TOP * scale,
              columnGap: LIST_GAP * scale,
              rowGap: LIST_GAP * scale,
            }}
          >
            {recentFestivals.map((festival) => (
              <FestivalContentCard
                key={festival.contentId}
                image={festival.thumbnailImageUrl}
                title={festival.title}
                startDate={festival.startDate}
                endDate={festival.endDate}
                regionName={festival.regionName}
                tags={toContentTagIds(festival.hashtags)}
                className="w-full"
                isAdmin={canManageByContentId.get(festival.contentId) ?? false}
                liked={getLiked(festival.contentId, festival.liked)}
                onClick={() =>
                  navigate(buildFestivalDetailPath(festival.contentId))
                }
                onLikeClick={() =>
                  toggleLike(
                    festival.contentId,
                    getLiked(festival.contentId, festival.liked)
                  )
                }
                onEdit={() => void editFestival(festival.contentId)}
                onDelete={() => requestDelete(festival.contentId)}
              />
            ))}
          </div>
        ) : (
          <p
            className="text-gray-4 text-center font-medium"
            style={{
              marginTop: EMPTY_MARGIN_TOP * scale,
              fontSize: MESSAGE_TEXT_SIZE * scale,
            }}
          >
            최근 본 행사가 없습니다.
          </p>
        )}
      </section>
      <FestivalDeleteDialog {...dialogProps} />
    </>
  );
}

export default FestivalRecentPage;
