import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  ConfirmDialog,
  ContentCard,
  ContentCardSkeleton,
  EditableContentCard,
} from '../../../components/common';
import { useCultureContents } from '../../../hooks/useCultureContents';
import { useContentDelete } from '../../../hooks/useContentDelete';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useEditFestival } from '../../../hooks/useEditFestival';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useIsAdmin } from '../../../hooks/useMyProfile';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { toContentTagIds } from '../../../utils/contentTags';
import { buildFestivalDetailPath } from '../../../utils/routes';
import type { ContentCategory, ContentSort } from '../../../types/content.type';

import { FestivalFilterBar } from '../components';
import { FESTIVAL_SKELETON_ITEMS } from '../constants/ui';
import useFestivalFilters from '../hooks/useFestivalFilters';

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
const ERROR_MARGIN_TOP = 24;
const MESSAGE_TEXT_SIZE = 13;
const LOAD_MORE_HEIGHT = 40;
const PAGE_SIZE = 20;

// festival/search와 동일한 필터 매핑 — 페이지마다 로컬로 둔다(다른 화면과
// 공유하는 순간 한쪽만 옵션이 바뀌어도 매핑이 깨질 수 있다).
const categoryByFilterValue: Record<string, ContentCategory | undefined> = {
  ALL: undefined,
  EXPERIENCE: 'EXPERIENCE',
  EXHIBITION: 'EXHIBITION',
  PERFORMANCE: 'PERFORMANCE',
  FESTIVAL: 'FESTIVAL',
};

const sortByFilterValue: Record<string, ContentSort> = {
  RECOMMENDED: 'RECOMMEND',
  SAVED: 'LIKE',
  DISTANCE: 'DISTANCE',
  ENDING_SOON: 'DEADLINE',
};

function FestivalOngoingPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const [searchParams] = useSearchParams();
  // region-info의 "OO에서 진행 중인 행사" 미리보기 → 전체보기로 들어올 때만
  // 채워진다. RegionCourseSection의 전체보기 링크와 동일하게 지역명을
  // keyword로 넘긴다(regionId 대신 — 이미 이 방식으로 결과가 일치함을
  // 확인했다).
  const region = searchParams.get('region') ?? '';
  const { getLiked, toggleLike } = useContentLikeToggle();
  const isAdmin = useIsAdmin();
  const { editFestival } = useEditFestival();
  const { requestDelete, dialogProps } = useContentDelete();
  const { selectedFilters, handleSortSelect, handleCategorySelect } =
    useFestivalFilters();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useCultureContents({
    statuses: ['ONGOING'],
    keyword: region || undefined,
    category: categoryByFilterValue[selectedFilters.category],
    sort: sortByFilterValue[selectedFilters.sort],
    size: PAGE_SIZE,
  });

  const festivals = data?.pages.flatMap((page) => page.items) ?? [];
  const hasEmptyResult = !isPending && !isError && festivals.length === 0;

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
    onIntersect: handleIntersect,
  });

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
            {region ? `${region}에서 진행 중인 행사` : '진행 중인 행사'}
          </h1>
          <p
            className="text-gray-5 font-normal"
            style={{
              marginTop: DESCRIPTION_MARGIN_TOP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
              lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
            }}
          >
            지금 참여할 수 있는 행사를 만나보세요
          </p>
        </div>

        <FestivalFilterBar
          selectedSort={selectedFilters.sort}
          selectedCategory={selectedFilters.category}
          onSortSelect={handleSortSelect}
          onCategorySelect={handleCategorySelect}
        />

        <div
          className="grid grid-cols-2"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            columnGap: LIST_GAP * scale,
            rowGap: LIST_GAP * scale,
          }}
        >
          {isPending
            ? FESTIVAL_SKELETON_ITEMS.map((item) => (
                <ContentCardSkeleton
                  key={item}
                  className="w-full"
                  imageClassName="aspect-[163/115] h-auto"
                />
              ))
            : festivals.map((festival) =>
                isAdmin ? (
                  <EditableContentCard
                    key={festival.contentId}
                    image={festival.thumbnailImageUrl}
                    title={festival.title}
                    firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
                    secondInfo={festival.regionName}
                    tags={toContentTagIds(festival.hashtags)}
                    className="w-full"
                    onClick={() =>
                      navigate(buildFestivalDetailPath(festival.contentId))
                    }
                    onEdit={() => void editFestival(festival.contentId)}
                    onDelete={() => requestDelete(festival.contentId)}
                  />
                ) : (
                  <ContentCard
                    key={festival.contentId}
                    image={festival.thumbnailImageUrl}
                    title={festival.title}
                    firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
                    secondInfo={festival.regionName}
                    tags={toContentTagIds(festival.hashtags)}
                    liked={getLiked(festival.contentId, false)}
                    className="w-full"
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
                )
              )}

          {isFetchingNextPage
            ? FESTIVAL_SKELETON_ITEMS.slice(0, 2).map((item) => (
                <ContentCardSkeleton
                  key={`next-page-${item}`}
                  className="w-full"
                  imageClassName="aspect-[163/115] h-auto"
                />
              ))
            : null}
        </div>

        {hasEmptyResult ? (
          <p
            className="text-gray-4 text-center font-medium"
            style={{
              marginTop: EMPTY_MARGIN_TOP * scale,
              fontSize: MESSAGE_TEXT_SIZE * scale,
            }}
          >
            진행 중인 행사가 없습니다.
          </p>
        ) : null}

        {isError ? (
          <p
            className="text-main-5 text-center font-medium"
            style={{
              marginTop: ERROR_MARGIN_TOP * scale,
              fontSize: MESSAGE_TEXT_SIZE * scale,
            }}
          >
            행사 목록을 불러오지 못했어요.
          </p>
        ) : null}

        <div
          ref={loadMoreRef}
          style={{ height: LOAD_MORE_HEIGHT * scale }}
          aria-hidden="true"
        />
      </section>
      <ConfirmDialog
        {...dialogProps}
        title="행사를 삭제할까요?"
        description="삭제한 행사는 되돌릴 수 없어요."
      />
    </>
  );
}

export default FestivalOngoingPage;
