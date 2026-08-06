import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';

import SelectedItemsSheet from '../../../local-recommendation/components/SelectedItemsSheet';
import SelectionPageLayout from '../../../local-recommendation/components/SelectionPageLayout';
import SelectionResultCard from '../../../local-recommendation/components/SelectionResultCard';
import { mockCourseEvents, searchMockCourseEvents } from '../constants/mockEvents';
import type { AdminCourseEventItem } from '../types';

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

  useEffect(() => {
    if (!region) {
      navigate('/admin/course-registration/region-selection', {
        replace: true,
      });
    }
  }, [region, navigate]);

  const searchResults = useMemo(() => searchMockCourseEvents(query), [query]);
  const selectedEventIds = useMemo(
    () => new Set(selectedEvents.map((event) => event.id)),
    [selectedEvents]
  );

  if (!region) return null;

  const handleAddEvent = (event: AdminCourseEventItem) => {
    if (selectedEvents.some((item) => item.id === event.id)) return;
    setSelectedEventsInStore([...selectedEvents, event]);
  };

  const handleRemoveEvent = (event: AdminCourseEventItem) => {
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
        searchSuggestions={mockCourseEvents.map((event) => event.title)}
        hideEmptySearchSuggestions
        items={searchResults}
        selectedItemIds={selectedEventIds}
        getItemId={(event) => event.id}
        onSearchChange={setQuery}
        onQueryChange={setQuery}
        onItemAdd={handleAddEvent}
        onBack={() =>
          navigate('/admin/course-registration/photo-tag', { replace: true })
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
