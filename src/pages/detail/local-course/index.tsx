import { useParams } from 'react-router-dom';

import { CourseDetailLayout, DetailStateGuard } from '../components';
import { useMappedData } from '../hooks/useMappedData';

import { mapCourseDetailDtoToViewModel } from '../mappers/courseDetailMapper';
import { mapLocalCourseToDetailDto } from '../mappers/localCourseDetailMapper';
import type { CourseDetail } from '../types/courseDetail';
import {
  localCoursePopularPreviews,
  localCourseRecentPreviews,
} from '../../../constants/localCourses';

const localCourseMockData = [
  ...localCoursePopularPreviews,
  ...localCourseRecentPreviews,
];

function LocalCourseDetailPage() {
  const { courseId } = useParams<{ courseId?: string }>();

  const { data: course, error } = useMappedData<CourseDetail>(
    () => {
      const localCourse =
        localCourseMockData.find((item) => String(item.id) === courseId) ??
        localCourseMockData[0];

      if (!localCourse) {
        throw new Error('코스 정보를 찾을 수 없습니다.');
      }

      return mapCourseDetailDtoToViewModel(
        mapLocalCourseToDetailDto(localCourse),
        localCourse.id
      );
    },
    [courseId],
    '로컬 코스 정보를 불러오지 못했습니다.'
  );

  return (
    <DetailStateGuard error={error} data={course}>
      {(courseData) => (
        <CourseDetailLayout course={courseData} reviewType="local-course" />
      )}
    </DetailStateGuard>
  );
}

export default LocalCourseDetailPage;
