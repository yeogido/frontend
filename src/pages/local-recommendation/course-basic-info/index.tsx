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

  const handleNext = (values: CourseBasicInfoValues) => {
    updateBasicInfo(values);
    navigate('/local-recommendation/tag-selection');
  };

  const handleBack = () => {
    // 지역 선택을 건너뛰고 바로 여기로 들어온 수정 흐름이라, 뒤로가기는
    // 등록 시작화면이 아니라 원래 보던 코스 상세로 보낸다.
    navigate(
      editingCourseId
        ? buildCourseDetailPath('LOCAL', editingCourseId)
        : '/local-recommendation'
    );
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
