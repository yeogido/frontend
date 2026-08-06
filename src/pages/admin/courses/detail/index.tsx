import { useNavigate, useParams } from 'react-router-dom';

import CourseDetailLayout from '../../../detail/components/CourseDetailLayout';
import { mapCourseDetailDtoToViewModel } from '../../../detail/mappers/courseDetailMapper';
import { mockCourseDetailsById } from '../constants/mockCourseDetails';

function AdminCourseMockDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const dto = courseId ? mockCourseDetailsById[courseId] : undefined;

  if (!dto) {
    return (
      <p className="p-6 text-center font-medium text-gray-4">
        존재하지 않는 코스입니다.
      </p>
    );
  }

  return (
    <CourseDetailLayout
      course={mapCourseDetailDtoToViewModel(dto)}
      reviewType="yeogido-course"
      onBack={() => navigate('/admin/courses')}
    />
  );
}

export default AdminCourseMockDetailPage;
