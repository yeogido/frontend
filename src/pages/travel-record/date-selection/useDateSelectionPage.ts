import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  getTravelRecordDraftDateRange,
  getTravelRecordDraftRegion,
  saveTravelRecordDraftDateRange,
} from '../utils/draftStorage';
import { getTravelRecordEditRoute } from '../utils/editRoute';
import { useTravelDateSelection } from './hooks';
import type { TravelDateSelectionLocationState } from './types';

/** 날짜 선택 화면의 상태와 "사진 추가하기" 이동. 모바일·데스크톱이 함께 쓴다. */
export function useDateSelectionPage() {
  const navigate = useNavigate();
  const { travelRecordId } = useParams<{ travelRecordId: string }>();
  const location = useLocation();
  const locationState =
    location.state as TravelDateSelectionLocationState | null;
  const storedSelectedRegion = useMemo(() => getTravelRecordDraftRegion(), []);
  const selectedRegion = locationState?.selectedRegion ?? storedSelectedRegion;
  const selection = useTravelDateSelection(getTravelRecordDraftDateRange());
  const { selectedRange } = selection;

  useEffect(() => {
    if (!selectedRegion) {
      navigate(
        travelRecordId
          ? getTravelRecordEditRoute(travelRecordId)
          : '/travel-record/new',
        { replace: true },
      );
    }
  }, [navigate, selectedRegion, travelRecordId]);

  const handleAddPhoto = () => {
    if (!selectedRange || !selectedRegion) {
      return;
    }

    saveTravelRecordDraftDateRange(selectedRange);

    navigate(
      travelRecordId
        ? getTravelRecordEditRoute(travelRecordId, 'photos')
        : '/travel-record/photo-selection',
      { state: { selectedRegion, selectedDateRange: selectedRange } },
    );
  };

  return { ...selection, navigate, selectedRegion, handleAddPhoto };
}
