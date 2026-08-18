import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
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
} from '../buildCourseRequest';
import { buildVisitEvents } from '../buildVisitEvents';
import { createRouteImage } from '../createRouteImage';
import type { VisitEvent } from '../constants';
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
  const [visitEvents, setVisitEvents] = useState<VisitEvent[]>(() =>
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
      )
    )
  );
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

  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveEventId(String(active.id));
  const handleDragCancel = () => setActiveEventId(null);
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveEventId(null);
    if (!over || active.id === over.id) return;

    const activeIndex = visitEvents.findIndex(
      (event) => event.id === active.id
    );
    const overIndex = visitEvents.findIndex((event) => event.id === over.id);
    if (activeIndex < 0 || overIndex < 0) return;

    const next = arrayMove(visitEvents, activeIndex, overIndex);
    setVisitEvents(next);
    setVisitOrder(next.map((event) => event.id));
  };

  const activeEvent =
    visitEvents.find((event) => event.id === activeEventId) ?? null;
  const activeEventOrder = activeEvent
    ? visitEvents.findIndex((event) => event.id === activeEvent.id) + 1
    : 0;

  const handleRegister = async (): Promise<{ courseId: number } | null> => {
    if (isSubmitting) return null;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const store = useLocalRecommendationStore.getState();
      const { draft: currentDraft, pendingImages } = store;
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
      const eventsWithImageKeys = visitEvents.map((event) =>
        event.kind === 'PLACE'
          ? {
              ...event,
              imageKey: imageKeyByPlaceId.get(event.id) ?? event.imageKey,
            }
          : event
      );
      const draftWithCoverKey = { ...currentDraft, coverImageKey };
      const validationError = getCourseRequestValidationError(
        draftWithCoverKey,
        eventsWithImageKeys
      );
      if (validationError) throw new Error(validationError);
      let travelData: VisitEventTravelData | undefined;
      try {
        travelData = await fetchVisitEventTravelData(eventsWithImageKeys);
      } catch {
        travelData = undefined;
      }

      let result: { courseId: number };

      if (currentDraft.editingCourseId) {
        // 방문 순서/장소가 바뀌었을 수 있으니 지도 경로 이미지도 새로
        // 만들어 올린다. 다만 지도 렌더링(카카오맵 SDK, 마커 이미지 CORS
        // 등)은 실패할 수 있는 부수적인 작업이라, 실패해도 본문 수정
        // 자체는 막지 않고 기존 경로 이미지를 그대로 둔다(best-effort).
        let routeImageKey: string | undefined;
        try {
          const routeImage = await createRouteImage(eventsWithImageKeys);
          routeImageKey = await uploadCourseImage(routeImage);
        } catch {
          routeImageKey = undefined;
        }
        const updatePayload = buildLocalCourseUpdateRequest(
          draftWithCoverKey,
          eventsWithImageKeys,
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
        const routeImage = await createRouteImage(eventsWithImageKeys);
        const routeImageKey = await uploadCourseImage(routeImage);
        const payload = buildCourseRequest(
          draftWithCoverKey,
          eventsWithImageKeys,
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
  };
}
