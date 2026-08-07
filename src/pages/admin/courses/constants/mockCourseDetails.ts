import {
  courseDetailMockData,
} from '../../../detail/constants/courseDetailMock';
import type { CourseDetailDto } from '../../../detail/types/courseDetail';
import { tagDefinitionMap } from '../../../../constants/tags';
import type { TagId } from '../../../../types/tag.type';
import {
  mockPopularCourseCards,
  mockRecentCourseCards,
} from './mockCourseCards';

interface MockDetailSource {
  id: string;
  image: string;
  title: string;
  tags: TagId[];
}

// 목록 카드 클릭 시 보여줄 상세 미리보기. 실제 코스 데이터가 없으므로
// courseDetailMockData(코스 상세 mock fixture)의 나머지 필드(코스 지도용
// stops, 뱃지 등)를 그대로 빌려 쓰고 카드별로 id/제목/이미지/태그만 바꾼다.
function buildMockCourseDetail(source: MockDetailSource): CourseDetailDto {
  return {
    ...courseDetailMockData,
    id: source.id,
    title: source.title,
    heroImageUrl: source.image,
    tags: source.tags.map((tagId) => ({
      id: tagId,
      tagId,
      label: tagDefinitionMap[tagId]?.label ?? tagId,
    })),
  };
}

export const mockCourseDetailsById: Record<string, CourseDetailDto> =
  Object.fromEntries(
    [...mockPopularCourseCards, ...mockRecentCourseCards].map((course) => [
      course.id,
      buildMockCourseDetail(course),
    ])
  );
