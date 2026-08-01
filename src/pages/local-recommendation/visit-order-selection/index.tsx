import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../components/layout/ResponsivePageShell';

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
    isUploading,
    uploadError,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
    handleRegister,
  } = useVisitOrderSelection();

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
          isUploading={isUploading}
          onSubmit={() => {
            void handleRegister().then((courseId) => {
              if (courseId !== null) {
                navigate(`/local-course/detail/${courseId}`);
              }
            });
          }}
        />
        {uploadError ? (
          <p role="alert" className="text-main-5 mt-3 text-center text-sm">
            {uploadError}
          </p>
        ) : null}
      </main>
    </ResponsivePageShell>
  );
}

export default VisitOrderSelectionPage;
