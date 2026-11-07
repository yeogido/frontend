import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../components/layout/ResponsivePageShell';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';

import {
  SortableVisitEventList,
  SubmitCourseButton,
  VisitOrderEditToolbar,
  VisitOrderHeader,
} from './components';
import { useVisitOrderSelection } from './hooks';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 60;
const PAGE_PADDING_BOTTOM = 30;

function VisitOrderSelectionPage() {
  const navigate = useNavigate();
  const {
    visitEventsByDay,
    visitEvents,
    activeEvent,
    activeEventOrder,
    sensors,
    isEditingCourse,
    isEditMode,
    canReorder,
    durationLabel,
    isAddDayDisabled,
    toggleEditMode,
    handleRemoveEvent,
    handleAddDay,
    handleDragStart,
    handleDragCancel,
    handleDragOver,
    handleDragEnd,
    handleRegister,
    isSubmitting,
    submitError,
  } = useVisitOrderSelection();
  const totalDays = useLocalRecommendationStore(
    (state) => state.draft.totalDays
  );

  const handleSubmit = async () => {
    const result = await handleRegister();

    if (result) {
      const detailPath = `/local-course/detail/${result.courseId}`;
      navigate(detailPath, {
        state: { fromCourseCreationFlow: true },
      });
    }
  };

  // 수정 흐름에서는 이 화면이 허브다 — 일차별 일정 추가는 그 일차의 장소
  // 선택으로 보냈다가 다시 여기로 돌아온다(선택 화면이 수정 중임을 보고
  // 다음 일차로 넘어가지 않는다).
  const handleAddSchedule = (dayIndex: number) =>
    navigate(`/local-recommendation/event-selection?day=${dayIndex + 1}`);

  // 수정 흐름은 앞 단계를 일차별로 되짚지 않고 키워드 화면으로 돌아간다.
  const handleBack = () =>
    navigate(
      isEditingCourse
        ? '/local-recommendation/tag-selection'
        : `/local-recommendation/place-selection?day=${Math.max(totalDays, 1)}`,
      { replace: true }
    );

  return (
    <ResponsivePageShell
      mode="standalone"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-white"
    >
      <main className="flex min-w-0 flex-1 flex-col">
        <VisitOrderHeader onBack={handleBack} />

        {isEditingCourse ? (
          <VisitOrderEditToolbar
            durationLabel={durationLabel}
            isEditMode={isEditMode}
            onToggleEditMode={toggleEditMode}
          />
        ) : null}

        <SortableVisitEventList
          visitEventsByDay={visitEventsByDay}
          activeEvent={activeEvent}
          activeEventOrder={activeEventOrder}
          sensors={sensors}
          canReorder={canReorder}
          isEditMode={isEditingCourse && isEditMode}
          onRemoveEvent={handleRemoveEvent}
          onAddSchedule={handleAddSchedule}
          onAddDay={handleAddDay}
          isAddDayDisabled={isAddDayDisabled}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        />

        <SubmitCourseButton
          onSubmit={handleSubmit}
          // 편집 중에는 '완료'로 편집을 닫은 다음 저장하게 한다.
          disabled={
            isSubmitting ||
            visitEvents.length === 0 ||
            (isEditingCourse && isEditMode)
          }
          isSubmitting={isSubmitting}
          isEditing={isEditingCourse}
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
