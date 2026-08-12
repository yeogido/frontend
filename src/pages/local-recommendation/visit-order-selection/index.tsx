import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../components/layout/ResponsivePageShell';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';

import {
  SortableVisitEventList,
  SubmitCourseButton,
  VisitOrderHeader,
} from './components';
import { useVisitOrderSelection } from './hooks';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 60;
const PAGE_PADDING_BOTTOM = 30;

function VisitOrderSelectionPage() {
  const navigate = useNavigate();
  const {
    visitEvents,
    activeEvent,
    activeEventOrder,
    sensors,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
    handleRegister,
    isSubmitting,
    submitError,
  } = useVisitOrderSelection();
  const isEditing = useLocalRecommendationStore(
    (state) => state.draft.editingCourseId !== null
  );

  const handleSubmit = async () => {
    const result = await handleRegister();

    if (result) {
      const detailPath = `/local-course/detail/${result.courseId}`;
      if (isEditing) {
        navigate(detailPath);
      } else {
        navigate(detailPath, {
          state: { fromCourseCreationFlow: true },
        });
      }
    }
  };

  return (
    <ResponsivePageShell
      mode="standalone"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-white"
    >
      <main className="flex min-w-0 flex-1 flex-col">
        <VisitOrderHeader
          onBack={() =>
            navigate('/local-recommendation/place-selection', { replace: true })
          }
        />

        <SortableVisitEventList
          visitEvents={visitEvents}
          activeEvent={activeEvent}
          activeEventOrder={activeEventOrder}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        />

        <SubmitCourseButton
          onSubmit={handleSubmit}
          disabled={isSubmitting || visitEvents.length === 0}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
        />
        {submitError ? (
          <p role="alert" className="text-main-5 mt-2 text-center text-sm">
            {submitError}
          </p>
        ) : null}
      </main>
    </ResponsivePageShell>
  );
}

export default VisitOrderSelectionPage;
