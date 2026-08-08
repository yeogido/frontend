import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';

import BackButton from '../../../local-recommendation/components/BackButton';
import { CourseBasicInfoForm } from '../../../local-recommendation/course-basic-info/components';
import type { CourseBasicInfoValues } from '../../../local-recommendation/course-basic-info/schema';

// Figma 390 디자인 기준 리터럴 px
const CONTAINER_PADDING_TOP = 48;
const CONTAINER_PADDING_BOTTOM = 32;
const TITLE_FONT_SIZE = 32;
const SUBTITLE_MARGIN_TOP = 12;
const SUBTITLE_FONT_SIZE = 14;

function AdminCourseBasicInfoPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const region = useAdminCourseRegistrationStore((state) => state.region);
  const basicInfo = useAdminCourseRegistrationStore((state) => state.basicInfo);
  const setBasicInfoInStore = useAdminCourseRegistrationStore(
    (state) => state.setBasicInfo
  );

  useEffect(() => {
    if (!region) {
      navigate('/admin/course-registration/region-selection', {
        replace: true,
      });
    }
  }, [region, navigate]);

  if (!region) return null;

  const handleNext = (values: CourseBasicInfoValues) => {
    setBasicInfoInStore(values);
    navigate('/admin/course-registration/photo-tag');
  };

  return (
    <ResponsivePageShell
      mode="standalone"
      topPadding={CONTAINER_PADDING_TOP}
      bottomPadding={CONTAINER_PADDING_BOTTOM}
      className="bg-white"
    >
      <BackButton
        onClick={() => navigate('/admin/course-registration/region-selection')}
      />
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
        defaultValues={basicInfo ?? undefined}
      />
    </ResponsivePageShell>
  );
}

export default AdminCourseBasicInfoPage;
