import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getCultureContents } from '../../../../apis/contents.api';
import { useIsDesktop } from '../../../../hooks/useIsDesktop';
import DesktopResultRow, {
  DesktopSelectedRow,
} from '../../../local-recommendation/desktop/DesktopResultRow';
import DesktopSearchField from '../../../local-recommendation/desktop/DesktopSearchField';
import DesktopSelectedPanel from '../../../local-recommendation/desktop/DesktopSelectedPanel';
import DesktopSelectionLayout from '../../../local-recommendation/desktop/DesktopSelectionLayout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';

import SelectedItemsSheet from '../../../local-recommendation/components/SelectedItemsSheet';
import SelectionPageLayout from '../../../local-recommendation/components/SelectionPageLayout';
import SelectionResultCard from '../../../local-recommendation/components/SelectionResultCard';
import { festivalSearchSuggestions } from '../../../local-recommendation/event-selection/constants/festivalSearchSuggestions';
import { searchFestivals } from '../../../local-recommendation/event-selection/festivalSearch';
import type { FestivalItem } from '../../../local-recommendation/event-selection/types';

const SEARCH_DEBOUNCE_MS = 300;
// Figma 390 디자인 기준 리터럴 px
const STATUS_MESSAGE_FONT_SIZE = 14;

function AdminCourseEventSelectionPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isDesktop = useIsDesktop();
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

  // debouncedQuery가 trimmedQuery를 따라잡기 전(디바운스 대기 구간)에는
  // 이전 검색어 기준 결과가 여전히 남아있어, 타이핑 중인데도 stale한
  // 이전 결과가 그대로 보이는 문제가 있었다. 이 구간은 isFetching과 별도로
  // "검색 대기 중"으로 취급해 이전 결과를 숨기고 검색 중 상태를 보여준다.
  const isDebouncePending = trimmedQuery !== debouncedQuery;

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

  const visibleResults = isDebouncePending ? [] : searchResults;

  const statusMessage = useMemo(() => {
    if (!trimmedQuery) return null;
    if (isDebouncePending || isFetching) return '행사를 검색하고 있어요...';
    if (isError) return '행사를 불러오지 못했어요. 다시 시도해 주세요.';
    if (searchResults.length === 0) return '검색 결과가 없어요.';
    return null;
  }, [
    trimmedQuery,
    isDebouncePending,
    isFetching,
    isError,
    searchResults.length,
  ]);

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

  const handleSkip = () => {
    setSelectedEventsInStore([]);
    navigate('/admin/course-registration/place-selection');
  };

  if (isDesktop) {
    const hasSelected = selectedEvents.length > 0;
    return (
      <DesktopSelectionLayout
        title="코스에 방문할 행사를 등록해 주세요"
        description="코스에 등록할 행사 및 페스티벌을 검색해 보세요"
        search={
          <DesktopSearchField
            placeholder="행사명을 검색해 주세요"
            label="행사명 검색"
            suggestions={festivalSearchSuggestions}
            onQueryChange={setQuery}
          />
        }
        statusMessage={
          statusMessage ? (
            <p className="text-gray-5 text-[16px]">{statusMessage}</p>
          ) : undefined
        }
        results={visibleResults.map((event) => (
          <DesktopResultRow
            key={event.id}
            visual="photo"
            title={event.title}
            description={event.address}
            imageSrc={event.imageSrc}
            disabled={selectedEventIds.has(event.id)}
            onAdd={() => handleAddEvent(event)}
          />
        ))}
        panel={
          <DesktopSelectedPanel
            title="추가된 행사"
            emptyMessage="아직 추가된 행사가 없어요"
            isEmpty={!hasSelected}
            onRemoveAll={() => setSelectedEventsInStore([])}
            submitLabel="행사 등록하기"
            isSubmitDisabled={!hasSelected}
            onSubmit={() =>
              navigate('/admin/course-registration/place-selection')
            }
            skipLabel={hasSelected ? undefined : '건너뛰기'}
            onSkip={hasSelected ? undefined : handleSkip}
          >
            {selectedEvents.map((event) => (
              <DesktopSelectedRow
                key={event.id}
                title={event.title}
                description={event.address}
                imageSrc={event.imageSrc}
                onRemove={() => handleRemoveEvent(event)}
              />
            ))}
          </DesktopSelectedPanel>
        }
      />
    );
  }

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
        items={visibleResults}
        selectedItemIds={selectedEventIds}
        getItemId={(event) => event.id}
        onSearchChange={setQuery}
        onItemAdd={handleAddEvent}
        onBack={() =>
          navigate('/admin/course-registration/photo-tag', { replace: true })
        }
        statusMessage={
          statusMessage ? (
            <p
              className="text-gray-5 text-center font-medium"
              style={{ fontSize: STATUS_MESSAGE_FONT_SIZE * scale }}
            >
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
        skipButtonLabel={selectedEvents.length === 0 ? '건너뛰기' : undefined}
        onSkip={selectedEvents.length === 0 ? handleSkip : undefined}
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
