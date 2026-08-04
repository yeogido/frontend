import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import SelectionPageLayout from '../components/SelectionPageLayout';
import SelectionResultCard from '../components/SelectionResultCard';
import SelectedItemsSheet from '../components/SelectedItemsSheet';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';
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
  const [query, setQuery] = useState('');
  const [selectedFestivals, setSelectedFestivals] = useState<FestivalItem[]>(
    () => draftFestivals.map((festival) => ({ ...festival, imageSrc: null }))
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

  const selectedFestivalIds = useMemo(
    () => new Set(selectedFestivals.map((festival) => festival.id)),
    [selectedFestivals]
  );

  const handleAddFestival = (festival: FestivalItem) => {
    if (selectedFestivals.some((item) => item.id === festival.id)) return;
    const next = [...selectedFestivals, festival];
    setSelectedFestivals(next);
    setFestivalsInStore(next);
  };

  const handleRemoveFestival = (festival: FestivalItem) => {
    const next = selectedFestivals.filter((item) => item.id !== festival.id);
    setSelectedFestivals(next);
    setFestivalsInStore(next);
  };

  const handleRemoveAllFestivals = () => {
    setSelectedFestivals([]);
    setFestivalsInStore([]);
  };

  return (
    <>
      <SelectionPageLayout
        title={
          <>
            코스에
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
          navigate('/local-recommendation/tag-selection', { replace: true })
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
        onSubmit={() => navigate('/local-recommendation/place-selection')}
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
