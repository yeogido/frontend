import { useNavigate } from 'react-router-dom';

import { DesktopPageShell } from '../../../../components/layout/desktop';

import { useVisitOrderSelection } from '../hooks';
import SortableVisitEventDesktopList from './SortableVisitEventDesktopList';

/**
 * 방문 순서 설정 — 데스크톱 뷰(Figma 6360:38793).
 *
 * 보기 모드와 편집 모드(Figma 6360:39305)는 모바일과 로직을 공유한다.
 */
function VisitOrderSelectionDesktopPage() {
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

  const handleSubmit = async () => {
    const result = await handleRegister();

    if (result) {
      navigate('/local-course/detail/' + result.courseId, {
        state: { fromCourseCreationFlow: true },
      });
    }
  };

  // 수정 흐름에서는 이 화면이 허브다 — 일차별 일정 추가는 그 일차의 장소
  // 선택으로 보냈다가 다시 여기로 돌아온다.
  const handleAddSchedule = (dayIndex: number) =>
    navigate('/local-recommendation/event-selection?day=' + (dayIndex + 1));

  const isSubmitDisabled =
    isSubmitting || visitEvents.length === 0 || (isEditingCourse && isEditMode);

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

          {isEditingCourse ? (
            <div className="flex items-center justify-between">
              <p className="text-[24px] font-semibold text-black">
                <span className="text-main-5">{durationLabel}</span> 코스
              </p>
              <button
                type="button"
                onClick={toggleEditMode}
                className="border-gray-3 text-gray-4 rounded-full border px-[10px] py-[6px] text-[14px] font-medium"
              >
                {isEditMode ? '완료' : '수정하기'}
              </button>
            </div>
          ) : null}

          <SortableVisitEventDesktopList
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
        </div>

        <div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 w-full rounded-[12px] py-[16px] text-[24px] font-semibold text-white disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? isEditingCourse
                ? '수정 중...'
                : '등록 중...'
              : isEditingCourse
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

export default VisitOrderSelectionDesktopPage;
