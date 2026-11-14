import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  removeContentLike,
  removeCourseLike,
  removePlaceLike,
} from '../../../apis/courses';
import {
  openKakaoMapPlace,
  openKakaoMapSearch,
} from '../../../components/kakaomap/utils/kakaoMapLink';
import { useToast } from '../../../components/toast';
import { useNavigateToCourseDetail } from '../../../hooks/useCourses';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import {
  formatTodayOpeningHours,
  usePlaceOpeningHours,
} from '../../../hooks/usePlaceOpeningHours';
import {
  readStoredUserLocation,
  requestUserLocation,
  type UserLocation,
} from '../../../utils/geolocation';
import { buildFestivalDetailPath } from '../../../utils/routes';
import {
  ALL_FILTER_OPTION,
  LIKED_CATEGORY_OPTIONS,
  LIKED_SORT_LATEST,
  LIKED_SORT_OPTIONS,
  likedCategoryByLabel,
  type LikedItemFilterKey,
} from '../constants/filters';
import type { LikedItem } from '../types';
import {
  filterLikedItems,
  getDetailFilterOptions,
  mapLikedItemResponse,
  sortLikedItems,
} from '../utils/likedItems';
import useLikedItemFilters from './useLikedItemFilters';
import { useLikedItems } from './useLikedItems';

/**
 * 좋아요 목록 화면의 상태·데이터·동작. 모바일과 데스크톱 뷰가 같이 쓴다.
 */
export function useLikesPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { goToCourseDetail } = useNavigateToCourseDetail();
  const [keyword, setKeyword] = useState('');
  const [unlikedIds, setUnlikedIds] = useState<ReadonlySet<string>>(new Set());
  const [initialUserLocation] = useState<UserLocation | null>(() =>
    readStoredUserLocation()
  );
  const [userLocation, setUserLocation] = useState<UserLocation | null>(
    initialUserLocation
  );

  useEffect(() => {
    if (initialUserLocation) return;

    let isActive = true;

    void requestUserLocation().then((location) => {
      if (!isActive) return;
      setUserLocation(location);
    });

    return () => {
      isActive = false;
    };
  }, [initialUserLocation]);

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
    refetch,
  } = useLikedItems({
    category,
    keyword: keyword.trim() || undefined,
    sort,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
  });

  const activeLikedItems = useMemo(
    () =>
      (
        data?.pages.flatMap((page) => page.items).map(mapLikedItemResponse) ??
        []
      ).filter((item) => !unlikedIds.has(`${item.category}-${item.id}`)),
    [data, unlikedIds]
  );

  const showDetailFilter =
    selectedFilters.category === ALL_FILTER_OPTION ||
    selectedFilters.category === '코스';

  const filterGroups = useMemo(() => {
    const groups: { key: LikedItemFilterKey; options: readonly string[] }[] = [
      { key: 'category', options: LIKED_CATEGORY_OPTIONS },
    ];

    if (showDetailFilter) {
      groups.push({
        key: 'detail',
        options: getDetailFilterOptions(
          selectedFilters.category,
          activeLikedItems
        ),
      });
    }

    groups.push({ key: 'sort', options: LIKED_SORT_OPTIONS });

    return groups;
  }, [selectedFilters.category, activeLikedItems, showDetailFilter]);

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

  /** 장소 카드의 첫 줄 — 오늘 영업시간. 없으면 안내 문구. */
  const getPlaceOpeningLabel = (item: LikedItem) => {
    const placeHours = openingHoursByItemId.get(item.id);
    const openingHours = placeHours && formatTodayOpeningHours(placeHours);

    return openingHours ?? '영업시간 정보 없음';
  };

  const handleCardClick = useCallback(
    (item: LikedItem) => {
      const placeId = item.externalPlaceId?.trim();

      if (item.category === 'COURSE') {
        void goToCourseDetail(item.id);
      } else if (item.category === 'EVENT') {
        navigate(buildFestivalDetailPath(item.id));
      } else if (placeId) {
        openKakaoMapPlace(placeId);
      } else {
        openKakaoMapSearch(`${item.title} ${item.location}`);
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

  return {
    keyword,
    setKeyword,
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
    filterGroups,
    likedItems,
    getPlaceOpeningLabel,
    handleCardClick,
    handleUnlike,
    loadMoreRef,
    isError,
    refetch,
    hasEmptyResult,
  };
}
