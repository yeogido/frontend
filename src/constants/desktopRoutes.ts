import { matchPath } from 'react-router-dom';

/**
 * 데스크톱 전용 뷰가 있는 경로.
 *
 * AppRouter에서 Responsive로 분기하는 경로와 같아야 한다 — App이 모바일
 * 프레임(가운데 정렬 + APP_MAX_WIDTH 상한)을 풀지 결정하는 데 같은 목록을
 * 쓰기 때문이다. 데스크톱 화면을 추가할 때 두 곳을 함께 고친다.
 */
export const DESKTOP_VIEW_PATHS = [
  '/',
  '/local-course',
  '/local-course/popular',
  '/local-recommendation',
  '/local-recommendation/course-info',
  '/local-recommendation/tag-selection',
  '/local-recommendation/visit-order-selection',
  '/local-recommendation/event-selection',
  '/local-recommendation/place-selection',
  '/local-course/detail/:courseId',
  '/login',
  '/signup',
  '/signup/kakao',
  '/signup/naver',
  '/forgot-password',
  '/forgot-password/reset',
  '/likes',
  '/my-posts',
  '/festival',
  '/festival/detail/:festivalId',
  '/festival/detail/:festivalId/courses',
  '/local-business',
  '/local-business/detail/:id',
] as const;

/** :courseId 같은 경로 파라미터가 있는 패턴도 맞춘다. 끝까지 일치해야 한다. */
export function hasDesktopView(pathname: string) {
  return DESKTOP_VIEW_PATHS.some((path) => matchPath(path, pathname) !== null);
}
