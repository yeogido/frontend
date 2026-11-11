import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';
import { useSelectionDay } from '../useSelectionDay';
import { usePlacePhotoModal } from './hooks/usePlacePhotoModal';
import { usePlaceSearch } from './hooks/usePlaceSearch';
import { useSelectedPlaces } from './hooks/useSelectedPlaces';

/**
 * 장소 등록 화면의 검색·선택·사진 모달·이동을 한데 묶는다. 모바일과
 * 데스크톱 뷰가 생김새만 다르고 흐름은 같아서 여기 한 곳에 둔다.
 */
export function usePlaceSelectionPage() {
  const navigate = useNavigate();
  const imageRecoveryRequired = useLocalRecommendationStore(
    (state) => state.imageRecoveryRequired
  );
  const { day, dayIndex, totalDays } = useSelectionDay();
  const isEditingCourse = useLocalRecommendationStore(
    (state) => state.draft.editingCourseId !== null
  );
  const { setQuery, searchResults } = usePlaceSearch();
  const {
    selectedPlaces,
    selectedPlaceIds,
    addSelectedPlace,
    removeSelectedPlace,
    removeAllSelectedPlaces,
  } = useSelectedPlaces(dayIndex);
  const photoModal = usePlacePhotoModal();
  const {
    pendingPlace,
    pendingImageFile,
    pendingImagePreviewUrl,
    clearModalState,
  } = photoModal;

  useEffect(() => {
    if (!imageRecoveryRequired) return;
    navigate('/local-recommendation/tag-selection', { replace: true });
  }, [imageRecoveryRequired, navigate]);

  const handleConfirmImage = () => {
    if (!pendingPlace || !pendingImageFile) return;

    addSelectedPlace(pendingPlace, pendingImageFile, pendingImagePreviewUrl);
    clearModalState();
  };

  const handleSubmitPlaces = () => {
    // 수정 흐름은 한 일차만 손보러 들어온 것이라 바로 수정 화면으로 돌아간다.
    // 신규 등록은 마지막 일차까지 채웠으면 방문 순서로, 아니면 다음 일차의
    // 행사 선택으로 이어간다.
    navigate(
      !isEditingCourse && day < totalDays
        ? `/local-recommendation/event-selection?day=${day + 1}`
        : '/local-recommendation/visit-order-selection'
    );
  };

  const handleBack = () =>
    navigate(`/local-recommendation/event-selection?day=${day}`, {
      replace: true,
    });

  return {
    day,
    setQuery,
    searchResults,
    selectedPlaces,
    selectedPlaceIds,
    removeSelectedPlace,
    removeAllSelectedPlaces,
    photoModal,
    handleConfirmImage,
    handleSubmitPlaces,
    handleBack,
  };
}
