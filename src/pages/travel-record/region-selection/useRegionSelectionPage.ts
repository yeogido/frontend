import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useTravelRecordSessionStore } from '../../../store/travelRecordSession.store';
import {
  clearTravelRecordDraftDateRange,
  clearTravelRecordDraftVisibility,
  getTravelRecordDraftRegion,
  saveTravelRecordDraftRegion,
} from '../utils/draftStorage';
import { getTravelRecordEditRoute } from '../utils/editRoute';
import { useTravelRecordRegionSelection } from './hooks';
import { getInitialTravelRecordRegion } from './initialSelectedRegion';

/** 지역 선택 화면의 상태와 "날짜 선택하기" 이동. 모바일·데스크톱이 함께 쓴다. */
export function useRegionSelectionPage() {
  const navigate = useNavigate();
  const { travelRecordId } = useParams<{ travelRecordId: string }>();
  const storedDraftRegion = getTravelRecordDraftRegion();
  const clearEdit = useTravelRecordSessionStore((state) => state.clearEdit);
  const isEditing = Boolean(travelRecordId);
  const selection = useTravelRecordRegionSelection(
    getInitialTravelRecordRegion(isEditing, storedDraftRegion),
  );
  const { selectedRegion } = selection;

  useEffect(() => {
    if (!travelRecordId) {
      clearEdit();
    }
  }, [clearEdit, travelRecordId]);

  const handleNext = () => {
    if (!selectedRegion) {
      return;
    }

    const draftRegion = {
      id: selectedRegion.id,
      regionId: selectedRegion.regionId,
      name: selectedRegion.name,
      province: selectedRegion.province,
      selectionName: selectedRegion.selectionName,
    };

    if (!isEditing) {
      clearTravelRecordDraftDateRange();
      clearTravelRecordDraftVisibility();
    }
    saveTravelRecordDraftRegion(draftRegion);

    navigate(
      travelRecordId
        ? getTravelRecordEditRoute(travelRecordId, 'date')
        : '/travel-record/date-selection',
      { state: { selectedRegion: draftRegion } },
    );
  };

  return { ...selection, navigate, handleNext };
}
