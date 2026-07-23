import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  SearchBar,
} from '../../../components/common';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import {
  FESTIVAL_RECENT_SEARCH_STORAGE_KEY,
  festivalRecentSearchKeywords,
  festivalSearchSuggestions,
} from '../constants/search';
import { addStoredRecentSearch } from '../../../utils/recentSearches';

import { FestivalFilterBar } from '../components';
import { FESTIVAL_SKELETON_ITEMS } from '../constants/ui';
import useFestivalFilters from '../hooks/useFestivalFilters';
import useFestivals from '../hooks/useFestivals';

function FestivalSearchPage() {
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

  return (
    <section
      className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col items-center bg-background pt-3 pb-10"
      aria-label="추천 행사 검색"
    >
      <SearchBar
        initialQuery={displaySearchQuery}
        className="z-20"
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

      <div className="mt-5 grid w-[342px] grid-cols-2 gap-x-4 gap-y-4">
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
                liked={festival.liked}
                tags={festival.tags}
                className="w-full"
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
        <p className="text-gray-4 mt-10 text-center text-[13px] font-medium">
          검색 결과가 없습니다.
        </p>
      ) : null}

      {isError ? (
        <p className="text-main-5 mt-6 text-center text-[13px] font-medium">
          행사 목록을 불러오지 못했어요.
        </p>
      ) : null}

      <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
    </section>
  );
}

export default FestivalSearchPage;
