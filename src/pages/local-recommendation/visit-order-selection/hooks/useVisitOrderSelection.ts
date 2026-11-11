import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../../../../apis/common';
import { getCourseDetail, updateCourse } from '../../../../apis/courses';
import { uploadCourseImage, uploadCourseImages } from '../../../../apis/files';
import { createLocalRecommendation } from '../../../../apis/localRecommendations';
import {
  LOCAL_RECOMMENDATION_COVER_IMAGE_ID,
  useLocalRecommendationStore,
} from '../../../../store/localRecommendation.store';
import { useAuthStore } from '../../../../store/auth.store';
import eventThumbnail from '../assets/event-thumbnail.png';
import {
  buildCourseRequest,
  buildLocalCourseUpdateRequest,
  getCourseRequestValidationError,
  hasCourseUpdates,
} from '../buildCourseRequest';
import {
  COURSE_MAX_TOTAL_DAYS,
  getCourseDurationLabel,
} from '../../../../utils/courseDetail';
import { buildVisitEvents } from '../buildVisitEvents';
import { createRouteImage } from '../createRouteImage';
import {
  findVisitEventDayIndex,
  parseDayDroppableId,
  toVisitOrder,
  type VisitEvent,
} from '../constants';
import {
  fetchVisitEventTravelData,
  type VisitEventTravelData,
} from '../useVisitEventTravelData';

function invalidateCourseListCaches(
  queryClient: ReturnType<typeof useQueryClient>
) {
  void queryClient.invalidateQueries({ queryKey: ['courses'] });
  void queryClient.invalidateQueries({ queryKey: ['popularCourses'] });
  void queryClient.invalidateQueries({ queryKey: ['popularLocalCourses'] });
  void queryClient.invalidateQueries({ queryKey: ['recommendedCourses'] });
  void queryClient.invalidateQueries({ queryKey: ['myCourseIds'] });
}

export function useVisitOrderSelection() {
  const draft = useLocalRecommendationStore((state) => state.draft);
  const pendingImages = useLocalRecommendationStore(
    (state) => state.pendingImages
  );
  const imageRecoveryRequired = useLocalRecommendationStore(
    (state) => state.imageRecoveryRequired
  );
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setVisitOrder = useLocalRecommendationStore(
    (state) => state.setVisitOrder
  );
  const resetDraft = useLocalRecommendationStore((state) => state.resetDraft);
  const removeVisitEventFromStore = useLocalRecommendationStore(
    (state) => state.removeVisitEvent
  );
  const setTotalDays = useLocalRecommendationStore(
    (state) => state.setTotalDays
  );
  const removePendingImage = useLocalRecommendationStore(
    (state) => state.removePendingImage
  );
  const [visitEventsByDay, setVisitEventsByDay] = useState<VisitEvent[][]>(() =>
    buildVisitEvents(
      draft.places,
      draft.festivals,
      draft.visitOrder,
      eventThumbnail,
      new Map(
        draft.places.flatMap((place) => {
          // 새로 고른 파일이 있으면 그 미리보기를, 없으면(수정 진입) 기존
          // 이미지 URL을 보여준다.
          const previewUrl =
            pendingImages[place.id]?.previewUrl ?? place.imageUrl;
          return previewUrl ? [[place.id, previewUrl] as const] : [];
        })
      ),
      draft.totalDays
    )
  );
  // 드래그 중에는 리렌더가 끝나기 전에 다음 포인터 이벤트가 올 수 있다.
  // 클로저 값으로 되써 넣으면 직전 일차 이동이 지워지므로, 항상 최신 목록을
  // ref에서 읽어 계산한다.
  const visitEventsByDayRef = useRef(visitEventsByDay);
  const dragSnapshotRef = useRef<VisitEvent[][] | null>(null);
  const applyVisitEventsByDay = (
    compute: (previous: VisitEvent[][]) => VisitEvent[][]
  ) => {
    const next = compute(visitEventsByDayRef.current);
    visitEventsByDayRef.current = next;
    setVisitEventsByDay(next);

    return next;
  };

  // 수정 흐름은 보기 모드로 들어온다 — '수정하기'를 눌러야 순서 변경과
  // 삭제가 열린다. 신규 등록은 처음부터 순서를 잡는 화면이라 토글이 없다.
  const isEditingCourse = draft.editingCourseId !== null;
  const [isEditMode, setIsEditMode] = useState(false);
  const canReorder = !isEditingCourse || isEditMode;

  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!imageRecoveryRequired) return;
    navigate('/local-recommendation/tag-selection', { replace: true });
  }, [imageRecoveryRequired, navigate]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    dragSnapshotRef.current = visitEventsByDayRef.current.map((day) => [
      ...day,
    ]);
    setActiveEventId(String(active.id));
  };
  const handleDragCancel = () => {
    if (dragSnapshotRef.current) {
      visitEventsByDayRef.current = dragSnapshotRef.current;
      setVisitEventsByDay(dragSnapshotRef.current);
      dragSnapshotRef.current = null;
    }
    setActiveEventId(null);
  };

  /**
   * 끄는 중에 다른 일차 위로 넘어가면 그 자리에서 바로 옮겨 둔다
   * (dnd-kit 멀티 컨테이너 방식). 최종 순서는 handleDragEnd가 확정한다.
   */
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    applyVisitEventsByDay((previous) => {
      const fromDay = findVisitEventDayIndex(previous, activeId);
      const overDay = parseDayDroppableId(overId);
      const toDay = overDay ?? findVisitEventDayIndex(previous, overId);
      if (fromDay < 0 || toDay < 0 || fromDay === toDay) return previous;

      const movedEvent = previous[fromDay].find(
        (event) => event.id === activeId
      );
      if (!movedEvent) return previous;

      const next = previous.map((dayEvents) => [...dayEvents]);
      next[fromDay] = next[fromDay].filter((event) => event.id !== activeId);
      // 일차 섹션 자체에 놓았으면 그 일차의 맨 뒤로 보낸다.
      const overIndex =
        overDay !== null
          ? next[toDay].length
          : next[toDay].findIndex((event) => event.id === overId);
      next[toDay].splice(
        overIndex < 0 ? next[toDay].length : overIndex,
        0,
        movedEvent
      );

      return next;
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    dragSnapshotRef.current = null;
    setActiveEventId(null);

    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;
    const next = applyVisitEventsByDay((previous) => {
      const dayIndex = findVisitEventDayIndex(previous, activeId);
      if (dayIndex < 0) return previous;

      const dayEvents = previous[dayIndex];
      const activeIndex = dayEvents.findIndex((event) => event.id === activeId);
      const overIndex = overId
        ? dayEvents.findIndex((event) => event.id === overId)
        : -1;
      if (overIndex < 0 || activeIndex === overIndex) return previous;

      return previous.map((events, index) =>
        index === dayIndex ? arrayMove(events, activeIndex, overIndex) : events
      );
    });

    // 일차를 넘나든 이동은 handleDragOver가 이미 반영했으니, 같은 일차 안에서
    // 순서가 그대로여도 스토어에는 항상 최종 상태를 저장한다.
    setVisitOrder(toVisitOrder(next));
  };

  /** 일정 하나를 코스에서 뺀다 — 스토어와 화면 목록을 함께 맞춘다. */
  const handleRemoveEvent = (eventId: string) => {
    removeVisitEventFromStore(eventId);
    // 장소와 함께 고른 사진도 버린다(미리보기 object URL 정리 포함).
    removePendingImage(eventId);
    applyVisitEventsByDay((previous) =>
      previous.map((dayEvents) =>
        dayEvents.filter((event) => event.id !== eventId)
      )
    );
  };

  const handleAddDay = () => {
    const nextTotalDays = visitEventsByDayRef.current.length + 1;
    if (nextTotalDays > COURSE_MAX_TOTAL_DAYS) return;

    // 기간(durationType)도 스토어가 함께 맞춘다 — 일수와 기간이 어긋나면
    // 서버가 거절한다(COMMON4001).
    setTotalDays(nextTotalDays);
    applyVisitEventsByDay((previous) => [...previous, []]);
  };

  const visitEvents = visitEventsByDay.flat();
  const activeEvent =
    visitEvents.find((event) => event.id === activeEventId) ?? null;
  const activeEventDay = activeEvent
    ? findVisitEventDayIndex(visitEventsByDay, activeEvent.id)
    : -1;
  const activeEventOrder =
    activeEvent && activeEventDay >= 0
      ? visitEventsByDay[activeEventDay].findIndex(
          (event) => event.id === activeEvent.id
        ) + 1
      : 0;

  const handleRegister = async (): Promise<{ courseId: number } | null> => {
    if (isSubmitting) return null;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const store = useLocalRecommendationStore.getState();
      const { draft: currentDraft, pendingImages } = store;

      // 수정 흐름에서 아무것도 손대지 않았다면 요청을 보낼 필요가 없다 —
      // 사진 업로드도, 경로 이미지 생성도, PATCH도 모두 건너뛴다.
      if (
        currentDraft.editingCourseId &&
        !hasCourseUpdates(currentDraft.dirtyFields)
      ) {
        const courseId = currentDraft.editingCourseId;
        resetDraft();

        return { courseId };
      }

      const coverImage = pendingImages[LOCAL_RECOMMENDATION_COVER_IMAGE_ID];

      // 수정 중 대표 사진을 새로 안 골랐다면 상세 조회로 알아낸 기존 key를
      // 그대로 쓴다(edit 진입 시 draft.coverImageKey에 이미 채워져 있다).
      if (!coverImage && !currentDraft.coverImageKey) {
        throw new Error(
          '대표 사진 정보를 찾을 수 없습니다. 사진을 다시 등록해 주세요.'
        );
      }

      const placeImageUploads = currentDraft.places.flatMap((place) => {
        const pendingImage = pendingImages[place.id];
        return pendingImage ? [{ placeId: place.id, pendingImage }] : [];
      });
      const pendingUploads = coverImage
        ? [
            coverImage,
            ...placeImageUploads.map(({ pendingImage }) => pendingImage),
          ]
        : placeImageUploads.map(({ pendingImage }) => pendingImage);
      const files = await Promise.all(
        pendingUploads.map(
          async (pendingImage) =>
            pendingImage.compressedFile ??
            (await pendingImage.compressionPromise) ??
            pendingImage.originalFile
        )
      );
      const uploadedKeys =
        files.length > 0 ? await uploadCourseImages(files) : [];
      const [coverImageKey, placeImageKeys] = coverImage
        ? [uploadedKeys[0], uploadedKeys.slice(1)]
        : [currentDraft.coverImageKey as string, uploadedKeys];
      const imageKeyByPlaceId = new Map(
        placeImageUploads.map(({ placeId }, index) => [
          placeId,
          placeImageKeys[index],
        ])
      );
      const eventsByDayWithImageKeys = visitEventsByDay.map((dayEvents) =>
        dayEvents.map((event) =>
          event.kind === 'PLACE'
            ? {
                ...event,
                imageKey: imageKeyByPlaceId.get(event.id) ?? event.imageKey,
              }
            : event
        )
      );
      const routeEvents = eventsByDayWithImageKeys.flat();
      const draftWithCoverKey = { ...currentDraft, coverImageKey };
      const validationError = getCourseRequestValidationError(
        draftWithCoverKey,
        eventsByDayWithImageKeys
      );
      if (validationError) throw new Error(validationError);
      let travelData: VisitEventTravelData | undefined;
      try {
        // 이동 시간은 같은 일차 안에서만 의미가 있다 — 서버도 일차를 넘는
        // 구간은 받지 않으므로 일차별로 따로 계산한다.
        // 한 일차가 타임아웃돼도 나머지 일차에서 받아온 값은 살린다.
        const travelDataByDay = await Promise.allSettled(
          eventsByDayWithImageKeys.map((dayEvents) =>
            fetchVisitEventTravelData(dayEvents)
          )
        );
        const settledDays = travelDataByDay.flatMap((result) =>
          result.status === 'fulfilled' ? [result.value] : []
        );
        travelData = {
          timesFromPreviousByEventId: new Map(
            settledDays.flatMap((day) => [...day.timesFromPreviousByEventId])
          ),
          operatingDaysByEventId: new Map(
            settledDays.flatMap((day) => [...day.operatingDaysByEventId])
          ),
        };
      } catch {
        travelData = undefined;
      }

      let result: { courseId: number };

      if (currentDraft.editingCourseId) {
        // 방문 순서/장소가 바뀌었을 수 있으니 지도 경로 이미지도 새로
        // 만들어 올린다. 다만 지도 렌더링(카카오맵 SDK, 마커 이미지 CORS
        // 등)은 실패할 수 있는 부수적인 작업이라, 실패해도 본문 수정
        // 자체는 막지 않고 기존 경로 이미지를 그대로 둔다(best-effort).
        // 일정이 그대로면 경로도 그대로라, 지도 이미지를 다시 만들지 않는다.
        let routeImageKey: string | undefined;
        if (currentDraft.dirtyFields.courseItems) {
          try {
            const routeImage = await createRouteImage(routeEvents);
            routeImageKey = await uploadCourseImage(routeImage);
          } catch {
            routeImageKey = undefined;
          }
        }
        const updatePayload = buildLocalCourseUpdateRequest(
          draftWithCoverKey,
          eventsByDayWithImageKeys,
          travelData,
          routeImageKey
        );
        if (!updatePayload) {
          throw new Error('코스 정보가 모두 입력되어야 수정할 수 있습니다.');
        }
        result = await updateCourse(
          currentDraft.editingCourseId,
          updatePayload
        );
        // 수정 자체는 이미 성공했으니, 아래 상세 재조회가 실패해도(네트워크
        // 오류 등) 캐시 무효화는 건너뛰지 않도록 먼저 처리한다.
        invalidateCourseListCaches(queryClient);
        void queryClient.invalidateQueries({
          queryKey: ['courseSummary', currentDraft.editingCourseId],
        });
        // 상세 페이지(local-course/detail)는 이 훅과 별도로 자기 캐시 키를
        // 쓴다. invalidateQueries만 하면 지금은 비활성 상태라(아직 상세로
        // 이동 전) 무효화만 되고 실제 재요청은 다음 마운트로 미뤄지는데,
        // 그 요청이 이동 직후 렌더링과 겹치면 잠깐 예전 데이터가 보이거나
        // 안 바뀐 것처럼 남을 수 있어 이동 전에 직접 새로 받아 채워 둔다.
        await queryClient.fetchQuery({
          queryKey: [
            'localCourseDetail',
            useAuthStore.getState().authGeneration,
            currentDraft.editingCourseId,
          ],
          queryFn: () =>
            getCourseDetail(currentDraft.editingCourseId as number),
        });
      } else {
        const routeImage = await createRouteImage(routeEvents);
        const routeImageKey = await uploadCourseImage(routeImage);
        const payload = buildCourseRequest(
          draftWithCoverKey,
          eventsByDayWithImageKeys,
          travelData,
          routeImageKey
        );
        if (!payload) {
          throw new Error('코스 정보가 모두 입력되어야 등록할 수 있습니다.');
        }
        result = await createLocalRecommendation(payload);
        invalidateCourseListCaches(queryClient);
      }

      resetDraft();
      return result;
    } catch (error) {
      // 위 유효성 검사는 throw new Error(...)라 여기서 그대로 보여준다.
      // 실제 API 실패(updateCourse/createLocalRecommendation 등)는 axios
      // 인터셉터가 NormalizedApiError(일반 객체, Error 인스턴스 아님)로
      // reject하므로, 그건 getApiErrorMessage로 서버가 내려준 실제 사유를
      // 보여준다 — 안 그러면 항상 이 아래 기본 문구만 보여 원인을 알 수 없다.
      setSubmitError(
        error instanceof Error
          ? error.message
          : getApiErrorMessage(
              error,
              '코스 등록에 실패했습니다. 다시 시도해 주세요.'
            )
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    visitEventsByDay,
    visitEvents,
    activeEvent,
    activeEventOrder,
    sensors,
    isEditingCourse,
    isEditMode,
    canReorder,
    durationLabel: getCourseDurationLabel(visitEventsByDay.length),
    isAddDayDisabled: visitEventsByDay.length >= COURSE_MAX_TOTAL_DAYS,
    toggleEditMode: () => setIsEditMode((previous) => !previous),
    handleRemoveEvent,
    handleAddDay,
    handleDragStart,
    handleDragCancel,
    handleDragOver,
    handleDragEnd,
    handleRegister,
    isSubmitting,
    submitError,
  };
}
