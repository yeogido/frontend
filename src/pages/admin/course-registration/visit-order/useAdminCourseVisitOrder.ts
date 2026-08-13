import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../../../../apis/common';
import { getCourseDetail, updateCourse } from '../../../../apis/courses';
import { uploadCourseImage } from '../../../../apis/files';
import { fetchHashtags } from '../../../../apis/hashtags';
import { createLocalRecommendation } from '../../../../apis/localRecommendations';
import { useToast } from '../../../../components/toast';
import { tagDefinitionMap } from '../../../../constants/tags';
import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';
import { useAuthStore } from '../../../../store/auth.store';
import eventThumbnail from '../../../local-recommendation/visit-order-selection/assets/event-thumbnail.png';
import type { VisitEvent } from '../../../local-recommendation/visit-order-selection/constants';
import { createRouteImage } from '../../../local-recommendation/visit-order-selection/createRouteImage';
import {
  fetchVisitEventTravelData,
  type VisitEventTravelData,
} from '../../../local-recommendation/visit-order-selection/useVisitEventTravelData';
import { mapTagIdsToHashtagIds } from '../../../local-recommendation/tag-selection/hashtagMapping';
import { VISIT_EVENT_PLACE_ID_PREFIX } from '../types';
import {
  buildAdminCourseRequest,
  buildAdminCourseUpdateRequest,
  getAdminCourseRequestValidationError,
} from './buildAdminCourseRequest';
import { buildAdminVisitEvents } from './buildAdminVisitEvents';
import {
  fetchImageAsFile,
  uploadAdminCourseImages,
} from './uploadAdminCourseImages';

const REGISTER_ERROR_MESSAGE = '코스 등록에 실패했습니다. 다시 시도해 주세요.';

export function useAdminCourseVisitOrder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const region = useAdminCourseRegistrationStore((state) => state.region);
  const basicInfo = useAdminCourseRegistrationStore((state) => state.basicInfo);
  const photo = useAdminCourseRegistrationStore((state) => state.photo);
  const keywordTagIds = useAdminCourseRegistrationStore(
    (state) => state.keywordTagIds
  );
  const selectedPlaces = useAdminCourseRegistrationStore(
    (state) => state.selectedPlaces
  );
  const selectedEvents = useAdminCourseRegistrationStore(
    (state) => state.selectedEvents
  );
  const storedVisitOrder = useAdminCourseRegistrationStore(
    (state) => state.visitOrder
  );
  const setVisitOrderInStore = useAdminCourseRegistrationStore(
    (state) => state.setVisitOrder
  );
  const editingCourseId = useAdminCourseRegistrationStore(
    (state) => state.editingCourseId
  );
  const existingThumbnailKey = useAdminCourseRegistrationStore(
    (state) => state.existingThumbnailKey
  );

  // storedVisitOrder는 순서를 매기는 힌트로만 쓰고, 실제 항목은 항상 현재
  // selectedPlaces/selectedEvents로 새로 만든다 — 그대로 쓰면 뒤로 가서
  // 장소/행사를 빼거나 추가한 뒤 다시 들어왔을 때 반영되지 않는다.
  const [visitEvents, setVisitEvents] = useState<VisitEvent[]>(() =>
    buildAdminVisitEvents(
      selectedPlaces,
      selectedEvents,
      eventThumbnail,
      storedVisitOrder.map((event) => event.id)
    )
  );
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    setVisitOrderInStore(next);
  };

  const activeEvent =
    visitEvents.find((event) => event.id === activeEventId) ?? null;
  const activeEventOrder = activeEvent
    ? visitEvents.findIndex((event) => event.id === activeEvent.id) + 1
    : 0;

  const registerMutation = useMutation({
    mutationFn: async () => {
      const validationError = getAdminCourseRequestValidationError({
        region,
        basicInfo,
        photo,
        existingThumbnailKey,
        visitEvents,
      });

      if (validationError) {
        throw new Error(validationError);
      }

      // 장소별 사진은 선택 사항이다. 직접 올린 파일이 있으면 그걸 쓰고,
      // 없지만 검색 시점에 가져온 구글 이미지(imageSrc)가 있으면 그 원격
      // 이미지를 내려받아 업로드 대상에 넣는다 — 그래야 구글 이미지로
      // 넘어간 장소도 imageKey를 받아 최종 등록에 반영된다. 구글 이미지
      // 다운로드가 실패하면(예: 만료된 URL) 해당 장소만 이미지 없이
      // 진행한다. 대표 사진은 새로 고른 경우에만 업로드하고(맨 앞에 넣어 결과
      // 배열의 첫 번째가
      // 되게 한다), 수정 중 그대로 둔 경우 상세 조회로
      // 알아낸 기존 key를 재사용한다.
      const placeImageEntries = await Promise.all(
        selectedPlaces.map(async (place) => {
          if (place.photoFile) {
            return { placeId: place.id, file: place.photoFile };
          }

          if (!place.existingImageKey && place.imageSrc) {
            try {
              const file = await fetchImageAsFile(
                place.imageSrc,
                `${place.id}.jpg`
              );
              return { placeId: place.id, file };
            } catch {
              return null;
            }
          }

          return null;
        })
      );
      const placeImageUploads = placeImageEntries.filter(
        (entry): entry is { placeId: string; file: File } => entry !== null
      );
      const uploadedKeys = await uploadAdminCourseImages(
        photo?.file
          ? [photo.file, ...placeImageUploads.map((upload) => upload.file)]
          : placeImageUploads.map((upload) => upload.file)
      );
      const thumbnailKey = photo?.file
        ? uploadedKeys[0]
        : (existingThumbnailKey as string);
      const placeImageKeys = photo?.file ? uploadedKeys.slice(1) : uploadedKeys;
      const imageKeyByPlaceId = new Map(
        placeImageUploads.map((upload, index) => [
          upload.placeId,
          placeImageKeys[index],
        ])
      );

      const eventsWithImageKeys = visitEvents.map((event) =>
        event.kind === 'PLACE'
          ? {
              ...event,
              imageKey:
                imageKeyByPlaceId.get(
                  event.id.slice(VISIT_EVENT_PLACE_ID_PREFIX.length)
                ) ?? event.imageKey,
            }
          : event
      );
      let travelData: VisitEventTravelData | undefined;
      try {
        travelData = await fetchVisitEventTravelData(eventsWithImageKeys);
      } catch {
        travelData = undefined;
      }

      const hashtags = await fetchHashtags();
      const hashtagIds = mapTagIdsToHashtagIds(
        keywordTagIds,
        hashtags,
        (tagId) => tagDefinitionMap[tagId]?.label
      );

      if (editingCourseId) {
        const updatePayload = buildAdminCourseUpdateRequest({
          region,
          basicInfo,
          photo,
          existingThumbnailKey,
          visitEvents: eventsWithImageKeys,
          thumbnailKey,
          hashtagIds,
          travelData,
        });

        if (!updatePayload) {
          throw new Error('코스 정보가 모두 입력되어야 수정할 수 있습니다.');
        }

        return updateCourse(editingCourseId, updatePayload);
      }

      // 우리동네 추천 코스 등록과 동일하게, 신규 등록일 때만 방문 순서로
      // 지도 경로 이미지를 만들어 올린다(수정 요청에는 routeImageKey 필드
      // 자체가 없어 못 바꾼다).
      const routeImage = await createRouteImage(eventsWithImageKeys);
      const routeImageKey = await uploadCourseImage(routeImage);

      const payload = buildAdminCourseRequest({
        region,
        basicInfo,
        photo,
        existingThumbnailKey,
        visitEvents: eventsWithImageKeys,
        thumbnailKey,
        routeImageKey,
        hashtagIds,
        travelData,
      });

      if (!payload) {
        throw new Error('코스 정보가 모두 입력되어야 등록할 수 있습니다.');
      }

      return createLocalRecommendation(payload);
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['popularCourses'] });
      queryClient.invalidateQueries({ queryKey: ['recommendedCourses'] });
      if (editingCourseId) {
        queryClient.invalidateQueries({
          queryKey: ['courseDetail', editingCourseId],
        });
        queryClient.invalidateQueries({
          queryKey: ['courseSummary', editingCourseId],
        });
        // invalidateQueries는 그 시점에 마운트돼서 보고 있는(active) 쿼리만
        // 즉시 다시 불러온다 — 지금은 아직 상세 화면으로 이동하기 전이라
        // 비활성 상태라 무효화만 되고 실제 재요청은 다음 마운트로 미뤄진다.
        // 그 요청이 이동 직후 화면이 그려지는 타이밍과 겹치면 잠깐 예전
        // 데이터가 보였다가 바뀌거나(연결이 느리면) 아예 안 바뀐 채로
        // 남는 것처럼 보일 수 있어, 이동하기 전에 새 데이터를 직접
        // 받아서 캐시에 채워 넣는다.
        await queryClient.fetchQuery({
          queryKey: [
            'yeogidoCourseDetail',
            useAuthStore.getState().authGeneration,
            editingCourseId,
          ],
          queryFn: () => getCourseDetail(editingCourseId),
        });
      }
      showToast(
        editingCourseId ? '코스를 수정했어요.' : '코스가 등록되었어요.'
      );
      // 여기서 reset()을 호출하면 region이 비워지면서 이 페이지의 가드
      // (useEffect: !region이면 region-selection으로 리다이렉트)가 먼저
      // 반응해 의도한 navigate보다 먼저 튕겨나가는 레이스가 생긴다
      // (관리자 행사 등록 때도 같은 문제가 있었다). 다음 등록을 시작할 때
      // /admin/courses의 FAB가 이미 reset을 호출하므로 여기서는 이동만 한다.
      // local-recommendation의 실제 등록 흐름(visit-order-selection/index.tsx)과
      // 동일하게, 방금 만든/수정한 코스를 바로 미리 볼 수 있도록 실제
      // 상세페이지로 이동한다. 관리자 계정으로 호출하면 서버가 courseType을
      // OFFICIAL로 만들어 여기도 추천 코스 상세(/yeogido-course/detail)에서
      // 조회된다.
      navigate(`/yeogido-course/detail/${result.courseId}`, {
        state: { fromAdminCourseCreationFlow: true },
      });
    },
  });

  const handleSubmit = () => {
    registerMutation.mutate();
  };

  return {
    visitEvents,
    activeEvent,
    activeEventOrder,
    sensors,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
    handleSubmit,
    isSubmitting: registerMutation.isPending,
    submitError: registerMutation.error
      ? registerMutation.error instanceof Error
        ? registerMutation.error.message
        : getApiErrorMessage(registerMutation.error, REGISTER_ERROR_MESSAGE)
      : null,
  };
}
