import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import CourseDetailLayout from '../../../detail/components/CourseDetailLayout';
import { mapCourseDetailDtoToViewModel } from '../../../detail/mappers/courseDetailMapper';
import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';
import { buildPreviewCourseDetail } from './buildPreviewCourseDetail';

function AdminCourseRegistrationPreviewPage() {
  const navigate = useNavigate();
  const region = useAdminCourseRegistrationStore((state) => state.region);
  const basicInfo = useAdminCourseRegistrationStore((state) => state.basicInfo);
  const photo = useAdminCourseRegistrationStore((state) => state.photo);
  const keywordTagIds = useAdminCourseRegistrationStore(
    (state) => state.keywordTagIds
  );
  const visitOrder = useAdminCourseRegistrationStore((state) => state.visitOrder);

  useEffect(() => {
    if (!region || !basicInfo) {
      navigate('/admin/course-registration/region-selection', {
        replace: true,
      });
      return;
    }

    if (visitOrder.length === 0) {
      navigate('/admin/course-registration/visit-order', { replace: true });
    }
  }, [region, basicInfo, visitOrder, navigate]);

  const courseDetail = useMemo(() => {
    if (!basicInfo) return null;

    const dto = buildPreviewCourseDetail({
      basicInfo,
      photo,
      keywordTagIds,
      visitEvents: visitOrder,
    });

    return mapCourseDetailDtoToViewModel(dto);
  }, [basicInfo, photo, keywordTagIds, visitOrder]);

  if (!region || !basicInfo || visitOrder.length === 0 || !courseDetail) {
    return null;
  }

  return (
    <CourseDetailLayout
      course={courseDetail}
      reviewType="yeogido-course"
      onBack={() => navigate('/admin/course-registration/visit-order')}
    />
  );
}

export default AdminCourseRegistrationPreviewPage;
