import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import SelectionPageLayout from '../components/SelectionPageLayout';
import SelectionResultCard from '../components/SelectionResultCard';
import SelectedItemsSheet from '../components/SelectedItemsSheet';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';
import { getCourseDayLabel } from '../../../utils/courseDetail';
import { useSelectionDay } from '../useSelectionDay';
import { getCultureContents } from '../../../apis/contents.api';
import { festivalSearchSuggestions } from './constants/festivalSearchSuggestions';
import { searchFestivals } from './festivalSearch';
import type { FestivalItem } from './types';

const SEARCH_DEBOUNCE_MS = 300;

function EventSelectionPage() {
  const navigate = useNavigate();
  const draftFestivals = useLocalRecommendationStore(
    (state) => state.draft.festivals
  );
  const setFestivalsInStore = useLocalRecommendationStore(
    (state) => state.setFestivals
  );
  const assignToDay = useLocalRecommendationStore((state) => state.assignToDay);
  const visitOrder = useLocalRecommendationStore(
    (state) => state.draft.visitOrder
  );
  const { day, dayIndex } = useSelectionDay();
  const isEditingCourse = useLocalRecommendationStore(
    (state) => state.draft.editingCourseId !== null
  );
  const [query, setQuery] = useState('');

  // 이 일차에 담긴 행사만 보여준다. 행사 자체는 draft.festivals에 한 벌로
  // 모여 있고, 어느 일차인지는 visitOrder가 들고 있다.
  const dayFestivalIds = useMemo(
    () => new Set(visitOrder[dayIndex] ?? []),
    [visitOrder, dayIndex]
  );
  const selectedFestivals = useMemo(
    () => draftFestivals.filter((festival) => dayFestivalIds.has(festival.id)),
    [draftFestivals, dayFestivalIds]
  );

  const trimmedQuery = query.trim();
  const [debouncedQuery, setDebouncedQuery] = useState(trimmedQuery);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedQuery(trimmedQuery),
      SEARCH_DEBOUNCE_MS
    );

    return () => window.clearTimeout(timeoutId);
  }, [trimmedQuery]);

  const {
    data: searchResults = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['event-selection', 'festival-search', debouncedQuery],
    queryFn: ({ signal }) =>
      searchFestivals(debouncedQuery, getCultureContents, signal),
    enabled: debouncedQuery.length > 0,
    staleTime: 30_000,
  });

  const statusMessage = useMemo(() => {
    if (!trimmedQuery) {
      return null;
    }

    if (isFetching) {
      return '행사를 검색하고 있어요...';
    }

    if (isError) {
      return '행사를 불러오지 못했어요. 다시 시도해 주세요.';
    }

    if (searchResults.length === 0) {
      return '검색 결과가 없어요.';
    }

    return null;
  }, [trimmedQuery, isFetching, isError, searchResults.length]);

  // 검색 결과의 "추가됨" 표시는 일차와 무관하다 — 같은 행사를 두 일차에
  // 넣을 수는 없다.
  const selectedFestivalIds = useMemo(
    () => new Set(draftFestivals.map((festival) => festival.id)),
    [draftFestivals]
  );

  const handleAddFestival = (festival: FestivalItem) => {
    if (draftFestivals.some((item) => item.id === festival.id)) return;
    setFestivalsInStore([...draftFestivals, festival]);
    assignToDay(dayIndex, festival.id);
  };

  const handleRemoveFestival = (festival: FestivalItem) => {
    setFestivalsInStore(
      draftFestivals.filter((item) => item.id !== festival.id)
    );
  };

  /** 이 일차의 행사만 비운다 — 다른 일차는 건드리지 않는다. */
  const handleRemoveAllFestivals = () => {
    setFestivalsInStore(
      draftFestivals.filter((festival) => !dayFestivalIds.has(festival.id))
    );
  };

  const goToPlaceSelection = () =>
    navigate(`/local-recommendation/place-selection?day=${day}`);

  const handleSkip = () => {
    handleRemoveAllFestivals();
    goToPlaceSelection();
  };

  return (
    <>
      <SelectionPageLayout
        title={
          <>
            {getCourseDayLabel(day)}에 방문할
            <br />
            행사를 등록해 주세요
          </>
        }
        description="코스에 등록할 행사 및 페스티벌을 검색해 보세요"
        searchPlaceholder="행사명을 검색해 주세요"
        searchLabel="행사명 검색"
        searchSuggestions={festivalSearchSuggestions}
        hideEmptySearchSuggestions
        items={searchResults}
        selectedItemIds={selectedFestivalIds}
        getItemId={(festival) => festival.id}
        onSearchChange={setQuery}
        onItemAdd={handleAddFestival}
        onBack={() =>
          navigate(
            // 수정 흐름은 앞 일차를 되짚지 않고 수정 화면(허브)으로 돌아간다.
            isEditingCourse
              ? '/local-recommendation/visit-order-selection'
              : day > 1
                ? `/local-recommendation/place-selection?day=${day - 1}`
                : '/local-recommendation/tag-selection',
            { replace: true }
          )
        }
        statusMessage={
          statusMessage ? (
            <p className="text-gray-5 text-center text-sm font-medium">
              {statusMessage}
            </p>
          ) : undefined
        }
        renderItem={(festival, isSelected, onItemAdd) => (
          <SelectionResultCard
            key={festival.id}
            item={festival}
            title={festival.title}
            description={festival.address}
            imageSrc={festival.imageSrc}
            imageAlt={`${festival.title} 행사 이미지`}
            action="add"
            disabled={isSelected}
            onItemAdd={onItemAdd}
          />
        )}
      />
      <SelectedItemsSheet
        selectedSectionTitle="추가된 행사"
        emptyMessage="아직 추가된 행사가 없어요"
        submitButtonLabel="행사 등록하기"
        selectedItems={selectedFestivals}
        isSubmitDisabled={selectedFestivals.length === 0}
        onItemRemove={handleRemoveFestival}
        onRemoveAll={handleRemoveAllFestivals}
        onSubmit={goToPlaceSelection}
        skipButtonLabel={
          selectedFestivals.length === 0 ? '건너뛰기' : undefined
        }
        onSkip={selectedFestivals.length === 0 ? handleSkip : undefined}
        renderItem={(festival, onItemRemove) => (
          <SelectionResultCard
            key={festival.id}
            item={festival}
            title={festival.title}
            description={festival.address}
            imageSrc={festival.imageSrc}
            imageAlt={`${festival.title} 행사 이미지`}
            action="remove"
            onItemRemove={onItemRemove}
          />
        )}
      />
    </>
  );
}

export default EventSelectionPage;
