import { useParams } from 'react-router-dom';

import { CourseDetailLayout, DetailStateGuard } from '../components';

import { mapCourseDetailDtoToViewModel } from '../mappers/courseDetailMapper';
import { useMappedData } from '../hooks/useMappedData';
import type { CourseDetail } from '../types/courseDetail';

import { courseDetailMockData } from '../constants/courseDetailMock';

function YeogidoCourseDetailPage() {
  const { courseId } = useParams<{ courseId?: string }>();

  // 1. DTO Mapper를 통한 데이터 및 런타임 에러 검증
  const { data: course, error } = useMappedData<CourseDetail>(
    () => mapCourseDetailDtoToViewModel(courseDetailMockData, courseId ?? '1'),
    [courseId],
    '코스 정보를 불러오지 못했습니다.'
  );

  return (
    <DetailStateGuard error={error} data={course}>
      {(course) => (
        <CourseDetailLayout course={course} reviewType="yeogido-course" />
      )}
    </DetailStateGuard>
  );
}

export default YeogidoCourseDetailPage;
