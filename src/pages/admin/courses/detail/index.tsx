import { useNavigate, useParams } from 'react-router-dom';

import ResponsiveCourseDetailLayout from '../../../detail/components/ResponsiveCourseDetailLayout';
import { mapCourseDetailDtoToViewModel } from '../../../detail/mappers/courseDetailMapper';
import { mockCourseDetailsById } from '../constants/mockCourseDetails';

function AdminCourseMockDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const dto = courseId ? mockCourseDetailsById[courseId] : undefined;

  if (!dto) {
    return (
      <p className="text-gray-4 p-6 text-center font-medium">
        존재하지 않는 코스입니다.
      </p>
    );
  }

  return (
    <ResponsiveCourseDetailLayout
      course={mapCourseDetailDtoToViewModel(dto)}
      reviewType="yeogido-course"
      onBack={() => navigate('/admin/courses')}
    />
  );
}

export default AdminCourseMockDetailPage;
