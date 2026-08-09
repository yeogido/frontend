import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../components/layout/ResponsivePageShell';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';
import { buildCourseDetailPath } from '../../../utils/routes';

import BackButton from '../components/BackButton';
import { CourseBasicInfoForm } from './components';
import type { CourseBasicInfoValues } from './schema';

// Figma 390 디자인 기준 리터럴 px
const CONTAINER_PADDING_TOP = 48;
const CONTAINER_PADDING_BOTTOM = 32;
const TITLE_FONT_SIZE = 32;
const SUBTITLE_MARGIN_TOP = 12;
const SUBTITLE_FONT_SIZE = 14;

function CourseBasicInfoPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const draftBasicInfo = useLocalRecommendationStore(
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

  return (
    <ResponsivePageShell
      mode="standalone"
      topPadding={CONTAINER_PADDING_TOP}
      bottomPadding={CONTAINER_PADDING_BOTTOM}
      className="bg-white"
    >
      <BackButton onClick={handleBack} />
      <header>
        <h1
          className="leading-[1.15] font-bold"
          style={{ fontSize: TITLE_FONT_SIZE * scale }}
        >
          어떤
          <br />
          코스인가요?
        </h1>
        <p
          className="text-gray-4"
          style={{
            marginTop: SUBTITLE_MARGIN_TOP * scale,
            fontSize: SUBTITLE_FONT_SIZE * scale,
          }}
        >
          코스의 기본 정보를 입력해주세요
        </p>
      </header>

      <CourseBasicInfoForm
        onNext={handleNext}
        defaultValues={draftBasicInfo ?? undefined}
      />
    </ResponsivePageShell>
  );
}

export default CourseBasicInfoPage;
