import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentCard } from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useRecentCultureContents } from '../../../hooks/useRecentCultureContents';
import { useAuthStore } from '../../../store/auth.store';
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
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const [likedContentIds, setLikedContentIds] = useState<number[]>([]);
  const recentFestivals = useRecentCultureContents();

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
  };

  return (
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
          className="font-normal text-gray-5"
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
            <ContentCard
              key={festival.contentId}
              image={festival.thumbnailImageUrl}
              title={festival.title}
              firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
              secondInfo={festival.regionName}
              tags={toContentTagIds(festival.hashtags)}
              liked={
                isLoggedIn &&
                festival.liked !==
                  likedContentIds.includes(festival.contentId)
              }
              className="w-full"
              onClick={() =>
                navigate(buildFestivalDetailPath(festival.contentId))
              }
              onLikeClick={() => handleLikeClick(festival.contentId)}
            />
          ))}
        </div>
      ) : (
        <p
          className="text-center font-medium text-gray-4"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: MESSAGE_TEXT_SIZE * scale,
          }}
        >
          최근 본 행사가 없습니다.
        </p>
      )}
    </section>
  );
}

export default FestivalRecentPage;
