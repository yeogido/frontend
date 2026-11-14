import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  getFolderPhotoSlotIndexes,
  getVisibleFolderPhotos,
} from '../components/folderPhotos';
import { getApiErrorMessage } from '../../../apis/common';
import { useToast } from '../../../components/toast';
import { useTravelRecordSessionStore } from '../../../store/travelRecordSession.store';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import {
  useCreateTravelRecord,
  useUpdateTravelRecord,
} from '../../../hooks/useTravelRecords';
import type { TravelFolderDecorationLocationState } from '../photo-selection/types';
import {
  appendFolderDecoration,
  getDecorationDragPoint,
  isFolderDecorationDropTarget,
  isActiveStickerDragPointer,
  shouldAppendFolderDecorationAfterDrag,
  type FolderDecorationSeed,
  type TravelFolderDecoration,
} from './folderDecoration';
import {
  getTravelRecordDraftDateRange,
  getTravelRecordDraftRegion,
  getTravelRecordDraftVisibility,
} from '../utils/draftStorage';
import {
  clearTravelRecordPhotoDraft,
  getTravelRecordPhotoDraft,
  type TravelRecordPhotoDraft,
} from '../utils/travelRecordSave';
import { getTravelRecordEditRoute } from '../utils/editRoute';
import { hasTravelRecordVersion, requireTravelRecordVersion } from '../utils/editVersion';
import { SAVE_SUCCESS_ANIMATION_MS } from './saveAnimation';
import {
  clearPhotoDraftAfterTravelRecordSave,
  isTravelRecordEditorLocked,
} from './saveState';

interface DraggingStickerState {
  seed: FolderDecorationSeed;
  pointerId: number;
  origin: { x: number; y: number };
  current: { x: number; y: number };
}

const createPreviewPhotoUrls = (photos: TravelRecordPhotoDraft[]) =>
  photos.slice(0, 2).map((photo) =>
    photo.source === 'server' ? photo.imageUrl : URL.createObjectURL(photo.file),
  );

const formatPeriod = (startDate: Date, endDate: Date) => {
  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${month}.${day}`;
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/** 폴더 꾸미기 화면의 상태·스티커 드래그·저장. 모바일·데스크톱이 함께 쓴다. */
export function useFolderDecorationPage() {
  const navigate = useNavigate();
  const { travelRecordId } = useParams<{ travelRecordId: string }>();
  const location = useLocation();
  const locationState =
    location.state as TravelFolderDecorationLocationState | null;
  const storedSelectedRegion = useMemo(() => getTravelRecordDraftRegion(), []);
  const storedSelectedDateRange = useMemo(
    () => getTravelRecordDraftDateRange(),
    []
  );
  const selectedRegion = locationState?.selectedRegion ?? storedSelectedRegion;
  const selectedDateRange =
    locationState?.selectedDateRange ?? storedSelectedDateRange;
  const previewPhotoUrlsRef = useRef<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<TravelRecordPhotoDraft[] | null>(null);
  const [previewPhotoUrls, setPreviewPhotoUrls] = useState<string[]>([]);
  const editSession = useTravelRecordSessionStore((state) => state.editSession);
  const clearEdit = useTravelRecordSessionStore((state) => state.clearEdit);
  const setListView = useTravelRecordSessionStore((state) => state.setListView);
  // 다른 기록의 편집 세션이 남아 있을 수 있고, 저장 후 뒤로가기로 되돌아오면
  // 세션이 이미 비워져 있다. id가 일치할 때만 서버 상태를 복원한 것으로 본다.
  const restoredEditSession =
    travelRecordId && editSession?.id === travelRecordId ? editSession : null;
  const restoredDecorations = restoredEditSession?.decorations ?? [];
  const [decorations, setDecorations] = useState<TravelFolderDecoration[]>(
    () => restoredDecorations,
  );
  const decorationsRef = useRef<TravelFolderDecoration[]>(restoredDecorations);
  const folderCanvasRef = useRef<HTMLDivElement>(null);
  const draggingStickerRef = useRef<DraggingStickerState | null>(null);
  const [draggingSticker, setDraggingSticker] =
    useState<DraggingStickerState | null>(null);
  const { showToast } = useToast();
  const scale = useGlobalScale();
  const createTravelRecordMutation = useCreateTravelRecord();
  const updateTravelRecordMutation = useUpdateTravelRecord();
  const isSavingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveComplete, setIsSaveComplete] = useState(false);
  const isEditorLocked = isTravelRecordEditorLocked(isSaving);
  const folderPhotos = useMemo<[string, ...string[]] | null>(() => {
    const firstPhoto = previewPhotoUrls[0];

    if (!firstPhoto) {
      return null;
    }

    return previewPhotoUrls.slice(0, 2) as [string, ...string[]];
  }, [previewPhotoUrls]);
  const photoSlotIndexes = useMemo(
    () =>
      getFolderPhotoSlotIndexes(
        getVisibleFolderPhotos(folderPhotos ?? []).length,
      ),
    [folderPhotos],
  );
  const regionName =
    selectedRegion?.selectionName ?? selectedRegion?.name ?? '';
  const periodLabel = selectedDateRange
    ? formatPeriod(selectedDateRange.startDate, selectedDateRange.endDate)
    : '';

  const replaceDecorations = (nextDecorations: TravelFolderDecoration[]) => {
    decorationsRef.current = nextDecorations;
    setDecorations(nextDecorations);
  };

  const appendDecoration = (
    seed: FolderDecorationSeed,
    point?: { x: number; y: number },
  ) => {
    const result = appendFolderDecoration(decorationsRef.current, seed, point);

    if (!result.added) {
      showToast(
        '\uC2A4\uD2F0\uCEE4\uB294 \uCD5C\uB300 10\uAC1C\uAE4C\uC9C0 \uB4F1\uB85D\uD560 \uC218 \uC788\uC5B4\uC694.',
      );
      return;
    }

    replaceDecorations(result.decorations);
  };
  const appendDecorationRef = useRef(appendDecoration);
  // 드롭 판정도 아트워크와 같은 슬롯을 봐야 한다. 아래 포인터 구독 effect가
  // 빈 deps로 한 번만 붙으므로 ref로 최신 값을 전달한다.
  const photoSlotIndexesRef = useRef(photoSlotIndexes);

  useEffect(() => {
    appendDecorationRef.current = appendDecoration;
    photoSlotIndexesRef.current = photoSlotIndexes;
  });

  const handleStickerDragStart = (
    seed: FolderDecorationSeed,
    point: { x: number; y: number },
    pointerId: number,
  ) => {
    if (draggingStickerRef.current) {
      return;
    }

    const nextDraggingSticker = {
      seed,
      pointerId,
      origin: point,
      current: point,
    };

    draggingStickerRef.current = nextDraggingSticker;
    setDraggingSticker(nextDraggingSticker);
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const currentDraggingSticker = draggingStickerRef.current;

      if (
        !currentDraggingSticker ||
        !isActiveStickerDragPointer(
          currentDraggingSticker.pointerId,
          event.pointerId,
        )
      ) {
        return;
      }

      const nextDraggingSticker = {
        ...currentDraggingSticker,
        current: { x: event.clientX, y: event.clientY },
      };

      draggingStickerRef.current = nextDraggingSticker;
      setDraggingSticker(nextDraggingSticker);
    };

    const clearDraggingSticker = () => {
      draggingStickerRef.current = null;
      setDraggingSticker(null);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const currentDraggingSticker = draggingStickerRef.current;

      if (
        !currentDraggingSticker ||
        !isActiveStickerDragPointer(
          currentDraggingSticker.pointerId,
          event.pointerId,
        )
      ) {
        return;
      }

      clearDraggingSticker();

      const canvasRect = folderCanvasRef.current?.getBoundingClientRect();
      const isDropTarget = Boolean(
        canvasRect &&
          isFolderDecorationDropTarget(
            canvasRect,
            event.clientX,
            event.clientY,
            photoSlotIndexesRef.current,
          ),
      );
      const dropPoint = isDropTarget && canvasRect
        ? getDecorationDragPoint(canvasRect, event.clientX, event.clientY)
        : null;

      const movedDistance = Math.hypot(
        event.clientX - currentDraggingSticker.origin.x,
        event.clientY - currentDraggingSticker.origin.y,
      );

      if (
        !shouldAppendFolderDecorationAfterDrag({
          isCancelled: false,
          movedDistance,
          isDropTarget,
        })
      ) {
        return;
      }

      appendDecorationRef.current(
        currentDraggingSticker.seed,
        isDropTarget ? dropPoint ?? undefined : undefined,
      );
    };

    const handlePointerCancel = (event: PointerEvent) => {
      const currentDraggingSticker = draggingStickerRef.current;

      if (
        !currentDraggingSticker ||
        !isActiveStickerDragPointer(
          currentDraggingSticker.pointerId,
          event.pointerId,
        )
      ) {
        return;
      }

      clearDraggingSticker();
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let previewPhotoUrls: string[] = [];

    void getTravelRecordPhotoDraft()
      .then((photos) => {
        previewPhotoUrls = createPreviewPhotoUrls(photos);

        if (!isMounted) {
          previewPhotoUrls.forEach((url) => URL.revokeObjectURL(url));
          return;
        }

        previewPhotoUrlsRef.current = previewPhotoUrls;
        setSelectedPhotos(photos);
        setPreviewPhotoUrls(previewPhotoUrls);
      })
      .catch(() => {
        if (isMounted) {
          setSelectedPhotos([]);
        }
      });

    return () => {
      isMounted = false;
      previewPhotoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSaveRecord = async () => {
    if (
      isSavingRef.current ||
      !selectedRegion ||
      !selectedDateRange ||
      !selectedPhotos ||
      selectedPhotos.length === 0
    ) {
      return;
    }

    if (travelRecordId && !hasTravelRecordVersion(restoredEditSession?.version)) {
      showToast('수정 버전을 확인할 수 없어요. 상세 화면에서 다시 수정해 주세요.');
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const uploadedPhotos = selectedPhotos.flatMap((photo) =>
        photo.source === 'new' ? [photo.file] : [],
      );
      // 수정 여부는 URL의 travelRecordId를 기준으로 판단한다. 세션에만
      // 의존하면 편집 URL로 바로 진입했을 때 수정 대신 새 기록이 생성된다.
      const result = travelRecordId
        ? {
            id: String(
              (
                await updateTravelRecordMutation.mutateAsync({
                  travelRecordId: Number(travelRecordId),
                  version: requireTravelRecordVersion(restoredEditSession?.version),
                  selectedRegion,
                  selectedDateRange,
                  selectedPhotos,
                  decorations,
                  isStickerStateRestored: restoredEditSession !== null,
                  originalTitle: restoredEditSession?.title,
                  originalRegionId: restoredEditSession?.regionId,
                })
              ).travelRecordId,
            ),
          }
        : {
            id: String(
              (
                await createTravelRecordMutation.mutateAsync({
                  visibility: getTravelRecordDraftVisibility(),
                  selectedRegion,
                  selectedDateRange,
                  selectedPhotos: uploadedPhotos,
                  decorations,
                })
              ).travelRecordId,
            ),
          };
      setIsSaveComplete(true);
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, SAVE_SUCCESS_ANIMATION_MS);
      });
      await clearPhotoDraftAfterTravelRecordSave(clearTravelRecordPhotoDraft);
      clearEdit();
      showToast('여행 기록이 저장되었어요.');
      // 방금 만든 폴더를 강조해 보여 주는 자리는 폴더 목록이라, 지도를 보던
      // 중에 저장했더라도 저장 직후에는 폴더 탭으로 돌려보낸다.
      setListView('folder');
      navigate('/travel-record', {
        state: {
          savedTravelRecordId: result.id,
          savedTravelRecordYear: selectedDateRange.endDate.getFullYear(),
        },
      });
    } catch (error) {
      isSavingRef.current = false;
      setIsSaving(false);
      // 사진 장수, 스티커 위치, 지역 등 실패 원인이 서버 문구로 구분되므로
      // 그대로 보여준다.
      showToast(getApiErrorMessage(error, '여행 기록을 저장하지 못했어요.'));
    }
  };

  useEffect(() => {
    if (!selectedRegion) {
      navigate(
        travelRecordId
          ? getTravelRecordEditRoute(travelRecordId)
          : '/travel-record/new',
        { replace: true },
      );
      return;
    }

    if (!selectedDateRange) {
      navigate(
        travelRecordId
          ? getTravelRecordEditRoute(travelRecordId, 'date')
          : '/travel-record/date-selection',
        { replace: true },
      );
      return;
    }

    if (selectedPhotos !== null && selectedPhotos.length === 0) {
      navigate(
        travelRecordId
          ? getTravelRecordEditRoute(travelRecordId, 'photos')
          : '/travel-record/photo-selection',
        { replace: true },
      );
    }
  }, [navigate, selectedDateRange, selectedPhotos, selectedRegion, travelRecordId]);

  return {
    decorations,
    draggingSticker,
    folderCanvasRef,
    folderPhotos,
    isEditorLocked,
    isSaveComplete,
    isSaving,
    navigate,
    periodLabel,
    regionName,
    scale,
    selectedPhotos,
    appendDecoration,
    handleSaveRecord,
    handleStickerDragStart,
    replaceDecorations,
    showToast,
  };
}
