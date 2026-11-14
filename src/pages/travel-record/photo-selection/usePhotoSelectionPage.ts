import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import type { TravelRecordApiVisibility } from '../../../types/travelRecord.type';
import { useTravelRecordSessionStore } from '../../../store/travelRecordSession.store';
import type { TravelPhotoSelectionLocationState } from '../date-selection/types';
import {
  getTravelRecordDraftDateRange,
  getTravelRecordDraftRegion,
  getTravelRecordDraftVisibility,
  saveTravelRecordDraftVisibility,
} from '../utils/draftStorage';
import { getTravelRecordEditRoute } from '../utils/editRoute';
import {
  saveTravelRecordPhotoDraft,
  TRAVEL_RECORD_PHOTO_DRAFT_ID,
  type TravelRecordPhotoDraft,
} from '../utils/travelRecordSave';
import { useDraggablePhotoOrder, useTravelRecordPhotoSelection } from './hooks';

/** 사진 선택 화면의 상태와 "폴더 꾸미기" 이동. 모바일·데스크톱이 함께 쓴다. */
export function usePhotoSelectionPage() {
  const navigate = useNavigate();
  const { travelRecordId } = useParams<{ travelRecordId: string }>();
  const location = useLocation();
  const locationState =
    location.state as TravelPhotoSelectionLocationState | null;
  const storedSelectedRegion = useMemo(() => getTravelRecordDraftRegion(), []);
  const storedSelectedDateRange = useMemo(
    () => getTravelRecordDraftDateRange(),
    [],
  );
  const selectedRegion = locationState?.selectedRegion ?? storedSelectedRegion;
  const selectedDateRange =
    locationState?.selectedDateRange ?? storedSelectedDateRange;
  const regionName =
    selectedRegion?.selectionName ?? selectedRegion?.name ?? '';
  const isEditing = useTravelRecordSessionStore(
    (state) => state.editSession !== null,
  );
  const [visibility, setVisibility] = useState<TravelRecordApiVisibility>(
    getTravelRecordDraftVisibility,
  );
  const selection = useTravelRecordPhotoSelection(isEditing);
  const { hasSelectedPhotos, photos, photosRef, reorderPhotos } = selection;
  const drag = useDraggablePhotoOrder({
    photosRef,
    onReorderPhotos: reorderPhotos,
  });

  const selectVisibility = (next: TravelRecordApiVisibility) => {
    setVisibility(next);
    saveTravelRecordDraftVisibility(next);
  };

  const handleDecorateFolder = async () => {
    if (!hasSelectedPhotos || !selectedRegion || !selectedDateRange) {
      return;
    }

    await saveTravelRecordPhotoDraft(
      photos.flatMap<TravelRecordPhotoDraft>((photo) => {
        if (photo.source === 'server' && photo.imageKey) {
          return [
            {
              source: 'server' as const,
              imageKey: photo.imageKey,
              imageUrl: photo.url,
            },
          ];
        }

        return photo.file ? [{ source: 'new' as const, file: photo.file }] : [];
      }),
    );
    navigate(
      travelRecordId
        ? getTravelRecordEditRoute(travelRecordId, 'decorate')
        : '/travel-record/folder-decoration',
      {
        state: {
          selectedRegion,
          selectedDateRange,
          photoDraftId: TRAVEL_RECORD_PHOTO_DRAFT_ID,
        },
      },
    );
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
    }
  }, [navigate, selectedDateRange, selectedRegion, travelRecordId]);

  return {
    ...selection,
    ...drag,
    isEditing,
    navigate,
    regionName,
    selectedDateRange,
    visibility,
    handleDecorateFolder,
    selectVisibility,
  };
}
