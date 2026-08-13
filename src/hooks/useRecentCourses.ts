import { useEffect, useState } from 'react';
import { useQueries } from '@tanstack/react-query';

import { getCourseDetail } from '../apis/courses';
import {
  RECENT_COURSES_UPDATED_EVENT,
  getStoredRecentCourses,
  removeRecentCourse,
} from '../utils/recentCourses';
import { isCourseNotFoundError } from './useReviews';
import { useAuthStore } from '../store/auth.store';

// 목록이 최대 10개라 요청 수가 묶여 있고, 한 번 확인한 코스는 이 시간 동안
// 다시 묻지 않는다. 코스 상세 조회(DETAIL_STALE_TIME)와 같은 쿼리 키를
// 쓰므로 값도 같은 1분으로 맞춘다.
const VALIDATION_STALE_TIME = 60_000;

function useStoredRecentCourses() {
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const [recentCourses, setRecentCourses] = useState(getStoredRecentCourses);
  const [storedAuthGeneration, setStoredAuthGeneration] =
    useState(authGeneration);

  if (storedAuthGeneration !== authGeneration) {
    setStoredAuthGeneration(authGeneration);
    setRecentCourses(getStoredRecentCourses());
  }

  useEffect(() => {
    const handleUpdate = () => setRecentCourses(getStoredRecentCourses());

    window.addEventListener(RECENT_COURSES_UPDATED_EVENT, handleUpdate);

    return () =>
      window.removeEventListener(RECENT_COURSES_UPDATED_EVENT, handleUpdate);
  }, []);

  return recentCourses;
}

/**
 * "최근 본 코스" 목록.
 *
 * 목록은 열람 시점의 스냅샷을 localStorage에 담아 두는 구조라, 서버에서
 * 코스가 사라져도 그대로 남는다. 내가 지운 코스는 삭제 시점에 정리되지만
 * (removeRecentCourse) 다른 사람이 지운 코스는 알 방법이 없어, 썸네일이
 * 깨진 카드가 계속 보였다.
 *
 * 그래서 그릴 때마다 각 코스가 아직 있는지 확인하고, 삭제된 것만 조용히
 * 걷어낸다. 저장된 스냅샷은 응답을 기다리지 않고 바로 보여주므로 첫 렌더가
 * 느려지지는 않는다. 조회 실패(네트워크 등)는 삭제로 보지 않는다 —
 * isCourseNotFoundError가 코스 코드(COURSE4041)만 보고 판단한다.
 */
export function useRecentCourses() {
  const recentCourses = useStoredRecentCourses();

  // /courses/{id}/summary가 아니라 상세를 쓴다. summary는 인증이 필요해
  // 비로그인 사용자에게는 전부 AUTH4011로 떨어져 검증이 무력화된다(확인함).
  // 상세는 비인증에도 COURSE4041을 준다. 게다가 코스 상세 화면과 같은
  // 쿼리 키라, 최근 카드를 눌렀을 때 이미 받아 둔 값이 그대로 쓰인다.
  const validations = useQueries({
    queries: recentCourses.map((course) => ({
      queryKey: ['courseDetail', course.courseId],
      queryFn: () => getCourseDetail(course.courseId),
      staleTime: VALIDATION_STALE_TIME,
      retry: false,
      refetchOnWindowFocus: false,
    })),
  });

  const deletedCourseIds = recentCourses
    .filter((_, index) => isCourseNotFoundError(validations[index]?.error))
    .map((course) => course.courseId);
  // 배열을 그대로 의존성에 넣으면 매 렌더 새 참조라 무한 루프가 된다.
  const deletedCourseIdKey = deletedCourseIds.join(',');

  useEffect(() => {
    if (!deletedCourseIdKey) return;

    deletedCourseIdKey.split(',').forEach((courseId) => {
      removeRecentCourse(Number(courseId));
    });
  }, [deletedCourseIdKey]);

  if (deletedCourseIds.length === 0) {
    return recentCourses;
  }

  return recentCourses.filter(
    (course) => !deletedCourseIds.includes(course.courseId)
  );
}

/**
 * 상세 화면이 "삭제된 코스" 응답을 받으면 최근 목록에서도 지운다.
 *
 * 목록 검증은 상세 캐시가 신선한 동안 다시 묻지 않아, 남이 지운 코스를
 * 최대 staleTime만큼 늦게 안다. 사용자가 직접 눌러 들어와 404를 확인한
 * 순간은 삭제가 가장 확실한 시점이라 여기서도 정리한다.
 */
export function useRemoveDeletedRecentCourse(
  courseId: number | null,
  error: unknown
) {
  const deletedCourseId =
    courseId !== null && isCourseNotFoundError(error) ? courseId : null;

  useEffect(() => {
    if (deletedCourseId === null) return;

    removeRecentCourse(deletedCourseId);
  }, [deletedCourseId]);
}
