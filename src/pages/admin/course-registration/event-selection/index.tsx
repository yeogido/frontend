import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getCultureContents } from '../../../../apis/contents.api';
import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';

import SelectedItemsSheet from '../../../local-recommendation/components/SelectedItemsSheet';
import SelectionPageLayout from '../../../local-recommendation/components/SelectionPageLayout';
import SelectionResultCard from '../../../local-recommendation/components/SelectionResultCard';
import { festivalSearchSuggestions } from '../../../local-recommendation/event-selection/constants/festivalSearchSuggestions';
import { searchFestivals } from '../../../local-recommendation/event-selection/festivalSearch';
import type { FestivalItem } from '../../../local-recommendation/event-selection/types';

const SEARCH_DEBOUNCE_MS = 300;

function AdminCourseEventSelectionPage() {
  const navigate = useNavigate();
  const region = useAdminCourseRegistrationStore((state) => state.region);
  const selectedEvents = useAdminCourseRegistrationStore(
    (state) => state.selectedEvents
  );
  const setSelectedEventsInStore = useAdminCourseRegistrationStore(
    (state) => state.setSelectedEvents
  );
  const [query, setQuery] = useState('');
  const trimmedQuery = query.trim();
  const [debouncedQuery, setDebouncedQuery] = useState(trimmedQuery);

  useEffect(() => {
    if (!region) {
      navigate('/admin/course-registration/region-selection', {
        replace: true,
      });
    }
  }, [region, navigate]);

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
    queryKey: ['admin-course-registration', 'event-search', debouncedQuery],
    queryFn: ({ signal }) =>
      searchFestivals(debouncedQuery, getCultureContents, signal),
    enabled: debouncedQuery.length > 0,
    staleTime: 30_000,
  });

  const statusMessage = useMemo(() => {
    if (!trimmedQuery) return null;
    if (isFetching) return '행사를 검색하고 있어요...';
    if (isError) return '행사를 불러오지 못했어요. 다시 시도해 주세요.';
    if (searchResults.length === 0) return '검색 결과가 없어요.';
    return null;
  }, [trimmedQuery, isFetching, isError, searchResults.length]);

  const selectedEventIds = useMemo(
    () => new Set(selectedEvents.map((event) => event.id)),
    [selectedEvents]
  );

  if (!region) return null;

  const handleAddEvent = (event: FestivalItem) => {
    if (selectedEvents.some((item) => item.id === event.id)) return;
    setSelectedEventsInStore([...selectedEvents, event]);
  };

  const handleRemoveEvent = (event: FestivalItem) => {
    setSelectedEventsInStore(
      selectedEvents.filter((item) => item.id !== event.id)
    );
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
        selectedItemIds={selectedEventIds}
        getItemId={(event) => event.id}
        onSearchChange={setQuery}
        onItemAdd={handleAddEvent}
        onBack={() =>
          navigate('/admin/course-registration/photo-tag', { replace: true })
        }
        statusMessage={
          statusMessage ? (
            <p className="text-gray-5 text-center text-sm font-medium">
              {statusMessage}
            </p>
          ) : undefined
        }
        renderItem={(event, isSelected, onItemAdd) => (
          <SelectionResultCard
            key={event.id}
            item={event}
            title={event.title}
            description={event.address}
            imageSrc={event.imageSrc}
            imageAlt={`${event.title} 행사 이미지`}
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
        selectedItems={selectedEvents}
        isSubmitDisabled={false}
        onItemRemove={handleRemoveEvent}
        onRemoveAll={() => setSelectedEventsInStore([])}
        onSubmit={() => navigate('/admin/course-registration/place-selection')}
        renderItem={(event, onItemRemove) => (
          <SelectionResultCard
            key={event.id}
            item={event}
            title={event.title}
            description={event.address}
            imageSrc={event.imageSrc}
            imageAlt={`${event.title} 행사 이미지`}
            action="remove"
            onItemRemove={onItemRemove}
          />
        )}
      />
    </>
  );
}

export default AdminCourseEventSelectionPage;
