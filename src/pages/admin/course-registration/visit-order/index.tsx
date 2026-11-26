import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { DesktopPageShell } from '../../../../components/layout/desktop';
import { useIsDesktop } from '../../../../hooks/useIsDesktop';
import SortableVisitEventDesktopList from '../../../local-recommendation/visit-order-selection/desktop/SortableVisitEventDesktopList';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';

import {
  SortableVisitEventList,
  SubmitCourseButton,
  VisitOrderHeader,
} from '../../../local-recommendation/visit-order-selection/components';
import { durationOptions } from '../../../local-recommendation/course-basic-info/constants/options';
import { useAdminCourseVisitOrder } from './useAdminCourseVisitOrder';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 60;
const PAGE_PADDING_BOTTOM = 30;
const SUBMIT_ERROR_FONT_SIZE = 14;

function AdminCourseVisitOrderPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isDesktop = useIsDesktop();
  const region = useAdminCourseRegistrationStore((state) => state.region);
  const basicInfo = useAdminCourseRegistrationStore((state) => state.basicInfo);
  const editingCourseId = useAdminCourseRegistrationStore(
    (state) => state.editingCourseId
  );
  const {
    visitEventsByDay,
    visitEvents,
    activeEvent,
    activeEventOrder,
    sensors,
    handleDragStart,
    handleDragCancel,
    handleDragOver,
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

  if (isDesktop) {
    return (
      <DesktopPageShell>
        <div className="flex flex-col gap-[60px]">
          <div className="flex flex-col gap-[32px]">
            <header className="flex flex-col gap-[6px]">
              <h1 className="text-[32px] font-semibold text-black">
                방문 순서를 설정해 주세요
              </h1>
              <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
                드래그하여 순서를 변경할 수 있어요
              </p>
            </header>
            {basicInfo ? (
              <p className="text-[24px] font-semibold text-black">
                <span className="text-main-5">
                  {
                    durationOptions.find(
                      (option) => option.value === basicInfo.duration
                    )?.label
                  }
                </span>{' '}
                코스
              </p>
            ) : null}
            <SortableVisitEventDesktopList
              visitEventsByDay={visitEventsByDay}
              activeEvent={activeEvent}
              activeEventOrder={activeEventOrder}
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragCancel={handleDragCancel}
              onDragEnd={handleDragEnd}
            />
          </div>
          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || visitEvents.length === 0}
              className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 w-full rounded-[12px] py-[16px] text-[24px] font-semibold text-white disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? '등록 중...'
                : editingCourseId
                  ? '코스 수정하기'
                  : '코스 등록하기'}
            </button>
            {submitError ? (
              <p
                role="alert"
                className="text-main-5 mt-[8px] text-center text-[16px]"
              >
                {submitError}
              </p>
            ) : null}
          </div>
        </div>
      </DesktopPageShell>
    );
  }

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
          visitEventsByDay={visitEventsByDay}
          activeEvent={activeEvent}
          activeEventOrder={activeEventOrder}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
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
