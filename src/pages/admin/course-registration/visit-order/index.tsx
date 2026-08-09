import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';

import {
  SortableVisitEventList,
  SubmitCourseButton,
  VisitOrderHeader,
} from '../../../local-recommendation/visit-order-selection/components';
import { useAdminCourseVisitOrder } from './useAdminCourseVisitOrder';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 60;
const PAGE_PADDING_BOTTOM = 30;
const SUBMIT_ERROR_FONT_SIZE = 14;

function AdminCourseVisitOrderPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const region = useAdminCourseRegistrationStore((state) => state.region);
  const editingCourseId = useAdminCourseRegistrationStore(
    (state) => state.editingCourseId
  );
  const {
    visitEvents,
    activeEvent,
    activeEventOrder,
    sensors,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
    handleSubmit,
    isSubmitting,
    submitError,
  } = useAdminCourseVisitOrder();

  useEffect(() => {
    if (!region) {
      navigate('/admin/course-registration/region-selection', {
        replace: true,
      });
    }
  }, [region, navigate]);

  if (!region) return null;

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
            navigate('/admin/course-registration/place-selection', {
              replace: true,
            })
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
          isEditing={Boolean(editingCourseId)}
        />
        {submitError ? (
          <p
            role="alert"
            className="text-main-5 mt-2 text-center"
            style={{ fontSize: SUBMIT_ERROR_FONT_SIZE * scale }}
          >
            {submitError}
          </p>
        ) : null}
      </main>
    </ResponsivePageShell>
  );
}

export default AdminCourseVisitOrderPage;
