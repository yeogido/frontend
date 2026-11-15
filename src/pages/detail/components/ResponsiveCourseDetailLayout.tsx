import Responsive from '../../../components/layout/Responsive';
import CourseDetailDesktopLayout from '../desktop/CourseDetailDesktopLayout';
import type { CourseDetailLayoutProps } from '../types/courseDetailLayout';
import { CourseDetailLayout } from './CourseDetailLayout';

/**
 * 코스 상세의 모바일/데스크톱 뷰를 고르는 진입점. 어드민 화면처럼 데스크톱
 * 시안이 없는 곳은 CourseDetailLayout을 그대로 쓰고, 시안이 있는 화면의
 * 페이지에서만 이 컴포넌트를 쓴다.
 */
export function ResponsiveCourseDetailLayout(props: CourseDetailLayoutProps) {
  return (
    <Responsive
      desktop={<CourseDetailDesktopLayout {...props} />}
      mobile={<CourseDetailLayout {...props} />}
    />
  );
}

export default ResponsiveCourseDetailLayout;
