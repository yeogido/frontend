import { useNavigate } from 'react-router-dom';

import {
  toCourseDetailState,
  type ReviewWithCourse,
} from '../utils/reviewNavigation';
import { buildCourseDetailPath } from '../utils/routes';

/**
 * 후기 카드를 누르면 그 코스의 상세로 가서 후기 상세를 띄운다.
 *
 * 코스 상세는 후기를 앞의 몇 개만 읽어서(useCourseReviewPreviews) id만 넘기면
 * 그 안에 없는 후기는 못 연다. 그래서 후기를 통째로 넘긴다.
 *
 * 응답에 courseType이 있는 목록(홈·최근 후기)에서 쓴다. 코스 타입을 모르는
 * 목록은 useNavigateToCourseDetail로 상세를 먼저 읽어야 한다.
 */
export function useOpenReviewInCourseDetail() {
  const navigate = useNavigate();

  return (review: ReviewWithCourse) =>
    navigate(buildCourseDetailPath(review.courseType, review.courseId), {
      state: toCourseDetailState(review),
    });
}
