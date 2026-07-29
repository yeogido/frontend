import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  SearchTriggerButton,
  SectionHeader,
} from '../../components/common';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useCultureContents } from '../../hooks/useCultureContents';
import { useLoginModal } from '../../hooks/useLoginModal';
import { useAuthStore } from '../../store/auth.store';
import { buildFestivalDetailPath } from '../../utils/routes';

import { FeaturedFestivalBanner } from './components';
import useFestivalPreviews from './hooks/useFestivalPreviews';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 21;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const SEARCH_MARGIN_TOP = 12;
const BANNER_MARGIN_TOP = 12;
const SECTION_MARGIN_TOP = 32;
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 16;

function FestivalPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const [likedContentIds, setLikedContentIds] = useState<number[]>([]);
  const { featuredFestival, recentFestivals } =
    useFestivalPreviews();
  const {
    data: cultureContents,
    isPending: isCultureContentsPending,
  } = useCultureContents({
    category: 'FESTIVAL',
    sort: 'RECOMMEND',
    size: 2,
  });
  const ongoingFestivals = cultureContents?.pages[0]?.items ?? [];

  const goToFestivalSearch = () => {
    navigate('/course-region-search?from=festival');
  };

  const goToOngoingFestivals = () => {
    navigate('/festival/ongoing');
  };

  const goToRecentFestivals = () => {
    navigate('/festival/recent');
  };

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
          어디로 떠나볼까요?
        </h1>
        <p
          className="font-normal text-gray-5"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          다양한 지역의 행사를 만나보세요
        </p>
      </div>

      <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
        <SearchTriggerButton
          label="행사명 또는 지역명 검색 화면으로 이동"
          placeholder="행사명 또는 지역명을 검색해 주세요"
          onClick={goToFestivalSearch}
        />
      </div>

      <div style={{ marginTop: BANNER_MARGIN_TOP * scale }}>
        <FeaturedFestivalBanner
          festival={featuredFestival}
          onClick={goToFestivalSearch}
        />
      </div>

      <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
        <SectionHeader
          title="진행 중인 행사"
          actionText="전체 보기"
          onActionClick={goToOngoingFestivals}
        />

        <div
          className="grid grid-cols-2"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            gap: LIST_GAP * scale,
          }}
        >
          {isCultureContentsPending ? (
            <>
              <ContentCardSkeleton />
              <ContentCardSkeleton />
            </>
          ) : (
            ongoingFestivals.map((festival) => (
              <ContentCard
                key={festival.contentId}
                image={festival.thumbnailImageUrl}
                title={festival.title}
                firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
                secondInfo={festival.regionName}
                tags={[]}
                liked={
                  isLoggedIn &&
                  likedContentIds.includes(festival.contentId)
                }
                className="w-full"
                onClick={() =>
                  navigate(buildFestivalDetailPath(festival.contentId))
                }
                onLikeClick={() => handleLikeClick(festival.contentId)}
              />
            ))
          )}
        </div>
      </section>

      <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
        <SectionHeader
          title="최근 본 행사"
          actionText="전체 보기"
          onActionClick={goToRecentFestivals}
        />

        <div
          className="grid grid-cols-2"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            gap: LIST_GAP * scale,
          }}
        >
          {recentFestivals.map((festival) => (
            <ContentCard
              key={festival.id}
              image={festival.image}
              title={festival.title}
              firstInfo={festival.period}
              secondInfo={festival.location}
              liked={
                isLoggedIn &&
                (festival.liked || likedContentIds.includes(festival.id))
              }
              tags={festival.tags}
              className="w-full"
              onClick={() =>
                navigate(buildFestivalDetailPath(festival.id))
              }
              onLikeClick={() => handleLikeClick(festival.id)}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

export default FestivalPage;
