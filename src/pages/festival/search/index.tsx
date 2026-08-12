import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  EditableContentCard,
  FestivalDeleteDialog,
  SearchBar,
} from '../../../components/common';
import { COURSE_REGION_RECENT_SEARCH_STORAGE_KEY } from '../../../constants/recentSearches';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useContentDelete } from '../../../hooks/useContentDelete';
import { useCultureContents } from '../../../hooks/useCultureContents';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useDistanceSortCoordinates } from '../../../hooks/useDistanceSortCoordinates';
import { useEditFestival } from '../../../hooks/useEditFestival';
import { useIsAdmin } from '../../../hooks/useMyProfile';
import { useResolvedRegion } from '../../region-info/hooks/useResolvedRegion';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { buildFestivalDetailPath } from '../../../utils/routes';
import {
  addStoredRecentSearch,
  getStoredRecentSearches,
  getUniqueSearches,
  removeStoredRecentSearch,
} from '../../../utils/recentSearches';
import { toContentTagIds } from '../../../utils/contentTags';
import type { ContentCategory, ContentSort } from '../../../types/content.type';

import { FestivalFilterBar } from '../components';
import {
  FESTIVAL_RECENT_SEARCH_STORAGE_KEY,
} from '../constants/search';
import { FESTIVAL_SKELETON_ITEMS } from '../constants/ui';
import useFestivalFilters from '../hooks/useFestivalFilters';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const LIST_MARGIN_TOP = 20;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const ERROR_MARGIN_TOP = 24;
const MESSAGE_TEXT_SIZE = 13;
const LOAD_MORE_HEIGHT = 40;
const recentSearchStorageOptions = {
  storageKey: COURSE_REGION_RECENT_SEARCH_STORAGE_KEY,
};
const festivalRecentSearchStorageOptions = {
  storageKey: FESTIVAL_RECENT_SEARCH_STORAGE_KEY,
};

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

function FestivalSearchPage() {
  const scale = useGlobalScale();
  const navigate = useNavigate();
  const { getLiked, toggleLike } = useContentLikeToggle();
  const isAdmin = useIsAdmin();
  const { editFestival } = useEditFestival();
  const { requestDelete, dialogProps } = useContentDelete();
  const [searchParams, setSearchParams] = useSearchParams();
  // 행사 검색 기록과 지역 검색 기록은 의도적으로 한 목록으로 합쳐 쓴다.
  // 읽을 때만 두 키를 합치고, 새로 입력한 키워드는 지역 키 한 곳에 모은다.
  const [recentSearchSuggestions, setRecentSearchSuggestions] = useState(() =>
    getUniqueSearches([
      ...getStoredRecentSearches(recentSearchStorageOptions),
      ...getStoredRecentSearches(festivalRecentSearchStorageOptions),
    ])
  );
  const keyword = searchParams.get('keyword') ?? '';
  const region = searchParams.get('region') ?? '';
  const subRegion = searchParams.get('subRegion') ?? '';
  const regionLabel =
    region && subRegion ? `${region} ${subRegion}` : subRegion || region;
  const displaySearchQuery = keyword || regionLabel;
  const {
    regionId,
    isPending: isRegionPending,
    isError: isRegionError,
  } = useResolvedRegion(regionLabel || undefined);
  const isRegionSearchReady =
    !regionLabel || (!isRegionPending && !isRegionError);
  const { selectedFilters, handleSortSelect, handleCategorySelect } =
    useFestivalFilters();
  const isDistanceSort = selectedFilters.sort === 'DISTANCE';
  const { coordinates: distanceSortCoordinates, status, requestCoordinates } =
    useDistanceSortCoordinates();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending: isCultureContentsPending,
  } = useCultureContents({
    keyword: keyword.trim() || undefined,
    regionId,
    category: categoryByFilterValue[selectedFilters.category],
    sort: sortByFilterValue[selectedFilters.sort],
    latitude: isDistanceSort ? distanceSortCoordinates?.latitude : undefined,
    longitude: isDistanceSort ? distanceSortCoordinates?.longitude : undefined,
    size: 20,
  }, {
    enabled:
      isRegionSearchReady &&
      (!isDistanceSort || status === 'ready' || status === 'failed'),
  });

  // 지역 해석이 실패하면 useCultureContents는 enabled:false로 남는데, 비활성
  // 쿼리는 status가 'pending'에서 갱신되지 않는다. 그대로 두면 에러 문구
  // 아래로 스켈레톤이 영원히 돌므로 여기서 덮어쓴다.
  const isPending = !isRegionError && isCultureContentsPending;

  const festivals = data?.pages.flatMap((page) => page.items) ?? [];
  const hasEmptyResult =
    !isRegionPending &&
    !isPending &&
    !isError &&
    !isRegionError &&
    festivals.length === 0;

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
      setRecentSearchSuggestions(
        addStoredRecentSearch(trimmedQuery, {
          ...recentSearchStorageOptions,
          currentSearches: recentSearchSuggestions,
        })
      );
    } else {
      nextSearchParams.delete('keyword');
      nextSearchParams.delete('region');
      nextSearchParams.delete('subRegion');
    }

    setSearchParams(nextSearchParams);
  };

  // 합쳐서 보여주는 목록이라 어느 쪽에 들어 있는지 알 수 없어 양쪽에서 지운다.
  const handleRemoveRecentSearchSuggestion = (suggestion: string) => {
    setRecentSearchSuggestions(
      removeStoredRecentSearch(suggestion, {
        ...recentSearchStorageOptions,
        currentSearches: recentSearchSuggestions,
      })
    );
    removeStoredRecentSearch(suggestion, {
      ...festivalRecentSearchStorageOptions,
      currentSearches: getStoredRecentSearches(festivalRecentSearchStorageOptions),
    });
  };

  return (
    <>
      <section
        className="bg-background mx-auto flex min-h-screen w-full flex-col"
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
          suggestions={recentSearchSuggestions}
          openSuggestionsOnMount
          onRemoveSuggestion={handleRemoveRecentSearchSuggestion}
          pinnedSuggestion={{
            label: '전국 확인하기',
            onSelect: () => navigate('/festival/search'),
          }}
          onSearch={handleSearch}
        />

        <FestivalFilterBar
          selectedSort={selectedFilters.sort}
          selectedCategory={selectedFilters.category}
          onSortSelect={(sort) => {
            handleSortSelect(sort);
            if (sort === 'DISTANCE') {
              void requestCoordinates();
            }
          }}
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
                    liked={getLiked(festival.contentId, festival.isLiked)}
                    tags={toContentTagIds(festival.hashtags)}
                    className="w-full"
                    onClick={() =>
                      navigate(buildFestivalDetailPath(festival.contentId))
                    }
                    onLikeClick={() =>
                      toggleLike(
                        festival.contentId,
                        getLiked(festival.contentId, festival.isLiked)
                      )
                    }
                  />
                )
              )}

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
            className="text-gray-4 text-center font-medium"
            style={{
              marginTop: EMPTY_MARGIN_TOP * scale,
              fontSize: MESSAGE_TEXT_SIZE * scale,
            }}
          >
            검색 결과가 없습니다.
          </p>
        ) : null}

        {isError || isRegionError ? (
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
      <FestivalDeleteDialog {...dialogProps} />
    </>
  );
}

export default FestivalSearchPage;
