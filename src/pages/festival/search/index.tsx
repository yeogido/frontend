import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  SearchBar,
} from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useAuthStore } from '../../../store/auth.store';
import { addStoredRecentSearch } from '../../../utils/recentSearches';

import { FestivalFilterBar } from '../components';
import {
  FESTIVAL_RECENT_SEARCH_STORAGE_KEY,
  festivalRecentSearchKeywords,
  festivalSearchSuggestions,
} from '../constants/search';
import { FESTIVAL_SKELETON_ITEMS } from '../constants/ui';
import useFestivalFilters from '../hooks/useFestivalFilters';
import useFestivals from '../hooks/useFestivals';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const LIST_MARGIN_TOP = 20;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const ERROR_MARGIN_TOP = 24;
const MESSAGE_TEXT_SIZE = 13;
const LOAD_MORE_HEIGHT = 40;

function FestivalSearchPage() {
  const scale = useGlobalScale();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const [likedOverrides, setLikedOverrides] = useState<Record<string, boolean>>(
    {}
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';
  const region = searchParams.get('region') ?? '';
  const subRegion = searchParams.get('subRegion') ?? '';
  const displaySearchQuery =
    keyword ||
    (region && subRegion ? `${region} ${subRegion}` : subRegion || region);
  const {
    selectedFilters,
    handleSortSelect,
    handleCategorySelect,
  } = useFestivalFilters();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useFestivals({
    filters: selectedFilters,
    keyword,
    region,
    subRegion,
  });

  const festivals = data?.pages.flatMap((page) => page.content) ?? [];
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

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    const nextSearchParams = new URLSearchParams(searchParams);

    if (trimmedQuery) {
      nextSearchParams.set('keyword', trimmedQuery);
      nextSearchParams.delete('region');
      nextSearchParams.delete('subRegion');
      addStoredRecentSearch(trimmedQuery, {
        storageKey: FESTIVAL_RECENT_SEARCH_STORAGE_KEY,
        fallbackSearches: festivalRecentSearchKeywords,
      });
    } else {
      nextSearchParams.delete('keyword');
      nextSearchParams.delete('region');
      nextSearchParams.delete('subRegion');
    }

    setSearchParams(nextSearchParams);
  };

  const handleLikeClick = (festivalId: number | string, isLiked: boolean) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setLikedOverrides((previous) => ({
      ...previous,
      [String(festivalId)]: !isLiked,
    }));
  };

  return (
    <section
      className="mx-auto flex min-h-screen w-full flex-col bg-background"
      style={{
        paddingLeft: PAGE_PADDING_X * scale,
        paddingRight: PAGE_PADDING_X * scale,
        paddingTop: PAGE_PADDING_TOP * scale,
        paddingBottom: PAGE_PADDING_BOTTOM * scale,
      }}
      aria-label="추천 행사 검색"
    >
        <SearchBar
            initialQuery={displaySearchQuery}
            placeholder="행사명 또는 지역명을 검색해 주세요"
            label="행사명 또는 지역명 검색"
            suggestions={festivalSearchSuggestions}
            onSearch={handleSearch}
          />


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
          : festivals.map((festival) => (
              <ContentCard
                key={festival.id}
                image={festival.image}
                title={festival.title}
                firstInfo={festival.period}
                secondInfo={festival.location}
                liked={likedOverrides[String(festival.id)] ?? festival.liked}
                tags={festival.tags}
                className="w-full"
                onLikeClick={() =>
                  handleLikeClick(
                    festival.id,
                    likedOverrides[String(festival.id)] ?? festival.liked
                  )
                }
              />
            ))}

        {isFetchingNextPage
          ? FESTIVAL_SKELETON_ITEMS.slice(0, 4).map((item) => (
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
          className="text-center font-medium text-gray-4"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: MESSAGE_TEXT_SIZE * scale,
          }}
        >
          검색 결과가 없습니다.
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
  );
}

export default FestivalSearchPage;
