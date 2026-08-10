import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { TravelRecordPageFrame } from '../components';
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
  getDraggingStickerPreviewStyle,
  isFolderDecorationDropTarget,
  isActiveStickerDragPointer,
  shouldAppendFolderDecorationAfterDrag,
  type FolderDecorationSeed,
  type TravelFolderDecoration,
} from './folderDecoration';
import {
  FolderDecorationCanvas,
  FolderDecorationPalette,
} from './components';
import {
  getTravelRecordDraftDateRange,
  getTravelRecordDraftRegion,
} from '../utils/draftStorage';
import {
  clearTravelRecordPhotoDraft,
  getTravelRecordPhotoDraft,
  type TravelRecordPhotoDraft,
} from '../utils/travelRecordSave';
import { getTravelRecordEditRoute } from '../utils/editRoute';
import { SAVE_SUCCESS_ANIMATION_MS } from './saveAnimation';
import { isTravelRecordEditorLocked } from './saveState';
import backIcon from '../../../assets/icons/back.svg';

const previousPageLabel =
  '\uC774\uC804 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30';
const titleFirstLine = '\uC5EC\uD589 \uD3F4\uB354\uB97C';
const titleSecondLine =
  '\uB354 \uD2B9\uBCC4\uD558\uAC8C \uAFB8\uBA70\uBCF4\uC138\uC694';
const description =
  '\uC2A4\uD2F0\uCEE4\uB97C \uCD94\uAC00\uD574 \uB098\uB9CC\uC758 \uD3F4\uB354\uB97C \uB9CC\uB4E4\uC5B4 \uBCF4\uC138\uC694. (\uC120\uD0DD)';
const saveRecordLabel = '\uAE30\uB85D \uC800\uC7A5\uD558\uAE30';

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

function TravelRecordFolderDecorationPage() {
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
      await clearTravelRecordPhotoDraft();
      clearEdit();
      showToast('여행 기록이 저장되었어요.');
      navigate('/travel-record', { state: { savedTravelRecordId: result.id } });
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

  return (
    <TravelRecordPageFrame className="bg-[#f9f9f9]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label={previousPageLabel}
        className="absolute top-[60px] left-6 flex size-6 items-center justify-start text-[#505050]"
      >
        <img src={backIcon} alt="" aria-hidden="true" className="size-6" />
      </button>

      <section className="absolute top-[100px] left-6 flex flex-col gap-3 text-[#1c1c1c]">
        <h1 className="text-[32px] leading-[1.18] font-semibold">
          {titleFirstLine}
          <br />
          {titleSecondLine}
        </h1>
        <p className="text-[14px] leading-none">{description}</p>
      </section>

      {folderPhotos ? (
        <section
          aria-label={`${regionName} \uC5EC\uD589 \uD3F4\uB354 \uBBF8\uB9AC\uBCF4\uAE30`}
          className="absolute top-[237px] left-1/2 flex w-[159px] -translate-x-1/2 flex-col items-center"
        >
          <FolderDecorationCanvas
            canvasRef={folderCanvasRef}
            photos={folderPhotos}
            title={regionName}
            decorations={decorations}
            onChange={replaceDecorations}
            isSaveComplete={isSaveComplete}
            isInteractionDisabled={isEditorLocked}
          />
          <h2 className="mt-3 text-center text-[16px] leading-none font-medium text-[#1c1c1c]">
            {regionName}
          </h2>
          <time className="mt-1.5 rounded-full bg-[#e4e4e4] px-2 py-1 text-[14px] leading-none font-normal text-[#7f7f7f]">
            {periodLabel}
          </time>
        </section>
      ) : null}

      <section className="absolute top-[503px] left-0 h-[341px] w-full bg-[#f9f9f9] shadow-[0_-1px_5px_rgba(0,0,0,0.07)]">
        <FolderDecorationPalette
          decorations={decorations}
          onLimitReached={() =>
            showToast(
              '\uC2A4\uD2F0\uCEE4\uB294 \uCD5C\uB300 10\uAC1C\uAE4C\uC9C0 \uB4F1\uB85D\uD560 \uC218 \uC788\uC5B4\uC694.',
            )
          }
          onAddSticker={appendDecoration}
          onStickerDragStart={handleStickerDragStart}
          isInteractionDisabled={isEditorLocked}
        />

        {draggingSticker
          ? createPortal(
              <img
                src={draggingSticker.seed.imageUrl}
                alt=""
                aria-hidden="true"
                className="pointer-events-none fixed z-70 size-[58px] object-contain"
                style={getDraggingStickerPreviewStyle(
                  draggingSticker.current,
                  scale,
                )}
              />,
              document.body,
            )
          : null}

        <button
          type="button"
          disabled={isSaving || !selectedPhotos?.length}
          aria-busy={isSaving}
          onClick={handleSaveRecord}
          className="absolute bottom-8 left-6 flex h-[53px] w-[342px] items-center justify-center rounded-xl bg-[#ff6f41] text-[18px] leading-none font-semibold text-[#f9f9f9] disabled:cursor-default disabled:bg-[#e4e4e4] disabled:text-[#7f7f7f]"
        >
          {saveRecordLabel}
        </button>
      </section>
    </TravelRecordPageFrame>
  );
}

export default TravelRecordFolderDecorationPage;
