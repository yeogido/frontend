import { useNavigate } from 'react-router-dom';

import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';
import { buildCourseDetailPath } from '../../../utils/routes';

import type { CourseBasicInfoValues } from './schema';

/**
 * 코스 기본 정보 화면의 스토어 연결과 이동 처리. 모바일/데스크톱 뷰가
 * 같은 흐름을 쓰므로 여기 한 곳에만 둔다.
 */
export function useCourseBasicInfoPage() {
  const navigate = useNavigate();
  const defaultValues = useLocalRecommendationStore(
    (state) => state.draft.basicInfo
  );
  const updateBasicInfo = useLocalRecommendationStore(
    (state) => state.updateBasicInfo
  );
  const editingCourseId = useLocalRecommendationStore(
    (state) => state.draft.editingCourseId
  );
  const resetDraft = useLocalRecommendationStore((state) => state.resetDraft);

  const handleNext = (values: CourseBasicInfoValues) => {
    updateBasicInfo(values);
    navigate('/local-recommendation/tag-selection');
  };

  const handleBack = () => {
    // 여기서 나가면(수정을 중단하든, 새 등록을 취소하든) draft를 비워야
    // editingCourseId 같은 값이 남아 다음 신규 등록이 이전 코스를 PATCH해
    // 버리는 사고를 막을 수 있다.
    const destination = editingCourseId
      ? buildCourseDetailPath('LOCAL', editingCourseId)
      : '/local-recommendation';

    resetDraft();
    navigate(destination);
  };

  return { defaultValues: defaultValues ?? undefined, handleNext, handleBack };
}
