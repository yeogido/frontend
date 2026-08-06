import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  CourseFilterBar,
  SearchBar,
} from '../../components/common';
import { useToast } from '../../components/toast';
import {
  LIKED_ITEM_FILTER_GRID_CLASS_NAME,
  getLikedItemFilterColumnClassName,
} from '../../constants/courseFilterLayout';
import {
  removeContentLike,
  removeCourseLike,
  removePlaceLike,
} from '../../apis/courses';
import { useNavigateToCourseDetail } from '../../hooks/useCourses';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import {
  formatTodayOpeningHours,
  usePlaceOpeningHours,
} from '../../hooks/usePlaceOpeningHours';
import { toContentTagIds } from '../../utils/contentTags';
import { buildFestivalDetailPath } from '../../utils/routes';

import {
  LIKED_CATEGORY_OPTIONS,
  LIKED_SORT_LATEST,
  LIKED_SORT_OPTIONS,
  likedCategoryByLabel,
  type LikedItemFilterKey,
} from './constants/filters';
import useLikedItemFilters from './hooks/useLikedItemFilters';
import { useLikedItems } from './hooks/useLikedItems';
import {
  filterLikedItems,
  getDetailFilterOptions,
  mapLikedItemResponse,
  sortLikedItems,
  toLikedItemInfoLines,
} from './utils/likedItems';
import type { LikedItem } from './types';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;
const SEARCH_MARGIN_TOP = 16;
const FILTER_MARGIN_TOP = 10;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const EMPTY_TEXT_SIZE = 13;
const ERROR_MARGIN_TOP = 24;
const LOAD_MORE_HEIGHT = 40;

function LikesPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { showToast } = useToast();
  const { goToCourseDetail } = useNavigateToCourseDetail();
  const [keyword, setKeyword] = useState('');
  const [unlikedIds, setUnlikedIds] = useState<ReadonlySet<string>>(new Set());

  const {
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
  } = useLikedItemFilters();

  const category = likedCategoryByLabel[selectedFilters.category] ?? 'ALL';
  const sort = selectedFilters.sort === LIKED_SORT_LATEST ? 'LATEST' : 'OLDEST';
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useLikedItems({
    category,
    keyword: keyword.trim() || undefined,
    sort,
  });

  const activeLikedItems = useMemo(
    () =>
      (
        data?.pages.flatMap((page) => page.items).map(mapLikedItemResponse) ??
        []
      ).filter((item) => !unlikedIds.has(`${item.category}-${item.id}`)),
    [data, unlikedIds]
  );

  const filterGroups = useMemo(
    () =>
      [
        { key: 'category', options: LIKED_CATEGORY_OPTIONS },
        {
          key: 'detail',
          options: getDetailFilterOptions(
            selectedFilters.category,
            activeLikedItems
          ),
        },
        { key: 'sort', options: LIKED_SORT_OPTIONS },
      ] as const satisfies readonly {
        key: LikedItemFilterKey;
        options: readonly string[];
      }[],
    [selectedFilters.category, activeLikedItems]
  );

  const likedItems = useMemo(
    () =>
      sortLikedItems(
        filterLikedItems({
          items: activeLikedItems,
          categoryLabel: selectedFilters.category,
          detailLabel: selectedFilters.detail,
          keyword,
        }),
        selectedFilters.sort
      ),
    [activeLikedItems, keyword, selectedFilters]
  );
  const openingHoursByItemId = usePlaceOpeningHours(
    likedItems.flatMap((item) =>
      item.category === 'PLACE'
        ? [{ id: item.id, name: item.title, address: item.location }]
        : []
    )
  );

  const handleCardClick = useCallback(
    (item: LikedItem) => {
      if (item.category === 'COURSE') {
        void goToCourseDetail(item.id);
      } else if (item.category === 'EVENT') {
        navigate(buildFestivalDetailPath(item.id));
      }
    },
    [goToCourseDetail, navigate]
  );

  const handleUnlike = async (item: LikedItem) => {
    try {
      if (item.category === 'COURSE') {
        await removeCourseLike(item.id);
      } else if (item.category === 'PLACE') {
        await removePlaceLike(item.id);
      } else {
        await removeContentLike(item.id);
      }

      setUnlikedIds((currentIds) =>
        new Set(currentIds).add(`${item.category}-${item.id}`)
      );
    } catch {
      showToast('좋아요 취소에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
    onIntersect: handleIntersect,
  });

  const hasEmptyResult = !isPending && !isError && likedItems.length === 0;

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
          좋아요한 코스와 장소
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          마음에 들었던 여행을 다시 만나보세요.
        </p>
      </div>

      <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
        <SearchBar
          placeholder="좋아요한 코스와 장소를 검색해 보세요"
          label="좋아요 목록 검색"
          onQueryChange={setKeyword}
          onSearch={setKeyword}
        />
      </div>

      <CourseFilterBar
        filterGroups={filterGroups}
        selectedFilters={selectedFilters}
        openFilterKey={openFilterKey}
        filterContainerRef={filterContainerRef}
        gridClassName={LIKED_ITEM_FILTER_GRID_CLASS_NAME}
        getColumnClassName={getLikedItemFilterColumnClassName}
        marginTop={FILTER_MARGIN_TOP}
        onToggle={handleFilterToggle}
        onSelect={handleFilterSelect}
      />

      {likedItems.length > 0 ? (
        <div
          className="grid grid-cols-2"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            columnGap: LIST_GAP * scale,
            rowGap: LIST_GAP * scale,
          }}
        >
          {likedItems.map((item) => {
            const itemKey = `${item.category}-${item.id}`;
            const { firstInfo, secondInfo, thirdInfo, distanceInfo } =
              toLikedItemInfoLines(item);
            const placeHours =
              item.category === 'PLACE'
                ? openingHoursByItemId.get(item.id)
                : undefined;
            const openingHours =
              placeHours && formatTodayOpeningHours(placeHours);

            return (
              <ContentCard
                key={itemKey}
                image={item.thumbnailUrl}
                title={item.title}
                firstInfo={
                  item.category === 'PLACE'
                    ? (openingHours ?? '영업시간 정보 없음')
                    : firstInfo
                }
                secondInfo={secondInfo}
                thirdInfo={thirdInfo}
                distanceInfo={distanceInfo}
                tags={toContentTagIds(item.hashtags)}
                liked
                className="w-full"
                onClick={
                  item.category === 'PLACE'
                    ? undefined
                    : () => handleCardClick(item)
                }
                onLikeClick={() => void handleUnlike(item)}
              />
            );
          })}
        </div>
      ) : null}

      {hasEmptyResult ? (
        <p
          className="text-gray-4 text-center font-medium"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: EMPTY_TEXT_SIZE * scale,
          }}
        >
          좋아요한 항목이 없습니다.
        </p>
      ) : null}

      {isError ? (
        <p
          className="text-main-5 text-center font-medium"
          style={{
            marginTop: ERROR_MARGIN_TOP * scale,
            fontSize: EMPTY_TEXT_SIZE * scale,
          }}
        >
          좋아요 목록을 불러오지 못했어요.
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

export default LikesPage;
