import { useNavigate } from 'react-router-dom';

import {
  SortableVisitEventList,
  SubmitCourseButton,
  VisitOrderHeader,
} from './components';
import { useVisitOrderSelection } from './hooks';

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
  } = useVisitOrderSelection();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[500px] flex-col overflow-x-hidden bg-white px-6 pt-[60px] pb-[30px]">
      <VisitOrderHeader onBack={() => navigate(-1)} />

      <SortableVisitEventList
        visitEvents={visitEvents}
        activeEvent={activeEvent}
        activeEventOrder={activeEventOrder}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      />

      <SubmitCourseButton onSubmit={handleRegister} />
    </main>
  );
}

export default VisitOrderSelectionPage;
