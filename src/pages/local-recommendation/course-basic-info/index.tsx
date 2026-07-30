import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../components/layout/ResponsivePageShell';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';

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

  const handleNext = (values: CourseBasicInfoValues) => {
    updateBasicInfo(values);
    navigate('/local-recommendation/tag-selection');
  };

  return (
    <ResponsivePageShell
      mode="standalone"
      topPadding={CONTAINER_PADDING_TOP}
      bottomPadding={CONTAINER_PADDING_BOTTOM}
      className="bg-white"
    >
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
