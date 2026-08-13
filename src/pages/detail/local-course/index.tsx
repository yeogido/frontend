import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import type { CourseDetailResult } from '../../../apis/courses';
import type { NormalizedApiError } from '../../../apis/common';
import { useToast } from '../../../components/toast';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useAuthStore } from '../../../store/auth.store';
import { NotFoundPage } from '../../not-found';
import { saveRecentCourse } from '../../../utils/recentCourses';
import { useRemoveDeletedRecentCourse } from '../../../hooks/useRecentCourses';
import { isCourseNotFoundError } from '../../../hooks/useReviews';
import { CourseDetailLayout, DetailStateGuard } from '../components';
import {
  mapCourseApiDetailToCourseSummary,
  mapCourseApiDetailToDto,
} from '../mappers/courseApiDetailMapper';
import { mapCourseDetailDtoToViewModel } from '../mappers/courseDetailMapper';
import {
  useLocalCourseDetail,
  useLocalCourseLikeMutation,
  useContentLikeMutation,
  usePlaceLikeMutation,
} from './useLocalCourseDetail';

function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  );
}

function addPendingId(
  ids: ReadonlySet<number>,
  id: number
): ReadonlySet<number> {
  return new Set(ids).add(id);
}

function removePendingId(
  ids: ReadonlySet<number>,
  id: number
): ReadonlySet<number> {
  const nextIds = new Set(ids);
  nextIds.delete(id);
  return nextIds;
}

function LocalCourseDetailPage() {
  const { courseId: courseIdParam } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { openLoginModal } = useLoginModal();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const parsedCourseId = Number(courseIdParam);
  const courseId =
    Boolean(courseIdParam && /^\d+$/.test(courseIdParam)) &&
    Number.isSafeInteger(parsedCourseId) &&
    parsedCourseId > 0
      ? parsedCourseId
      : null;
  const { data, isError, error } = useLocalCourseDetail(courseId);

  // 삭제된 코스로 들어왔다면 최근 본 목록에서도 걷어낸다.
  useRemoveDeletedRecentCourse(courseId, error);

  const likeMutation = useLocalCourseLikeMutation();
  const placeLikeMutation = usePlaceLikeMutation();
  const contentLikeMutation = useContentLikeMutation();
  const [pendingPlaceIds, setPendingPlaceIds] = useState<ReadonlySet<number>>(
    () => new Set()
  );
  const [pendingContentIds, setPendingContentIds] = useState<
    ReadonlySet<number>
  >(() => new Set());

  const course = useMemo(() => {
    if (!data || data.courseType !== 'LOCAL') {
      return null;
    }

    try {
      return mapCourseDetailDtoToViewModel(mapCourseApiDetailToDto(data));
    } catch {
      return null;
    }
  }, [data]);

  useEffect(() => {
    if (!data || data.courseType !== 'LOCAL') return;

    saveRecentCourse({
      ...mapCourseApiDetailToCourseSummary(data),
      courseType: 'LOCAL',
    });
  }, [data]);

  if (courseId === null || isError || (data && !course)) {
    // 조회 실패를 전부 삭제로 안내하면 네트워크 장애나 잘못된 주소까지
    // "작성자가 삭제했다"고 단정하게 된다. 삭제 판정은 코스 코드
    // (COURSE4041)만 보는 isCourseNotFoundError에 맡기고, 그 외에는
    // 원인을 특정하지 않는 기본 문구를 쓴다.
    return isCourseNotFoundError(error) ? (
      <NotFoundPage
        title="삭제된 코스예요"
        description="작성자가 삭제했거나 주소가 잘못되었어요."
      />
    ) : (
      <NotFoundPage />
    );
  }

  const handleBack = () => {
    // 코스 등록·수정 플로우(방문 순서 정하기)를 마치고 넘어온 상세 페이지라면,
    // 뒤로가기로 그 플로우(장소 선택 등)로 되돌아가지 않고 인기 코스
    // 목록으로 보낸다.
    const cameFromCourseCreationFlow = Boolean(
      (location.state as { fromCourseCreationFlow?: boolean } | null)
        ?.fromCourseCreationFlow
    );

    if (cameFromCourseCreationFlow) {
      navigate('/local-course/popular', { replace: true });
      return;
    }

    // history.state.idx는 react-router의 브라우저 히스토리 항목 인덱스라,
    // 0이면 이 탭에서 처음 들어온 화면(직접 링크로 진입 등)이라 뒤로 갈
    // 곳이 없다 — 그때만 우리동네 코스 목록으로 대체 이동한다. 그 외에는
    // 실제로 들어온 경로(코스 검색, 행사에 포함된 코스 등)로 돌아간다.
    // 대체 이동은 replace로 해서, 이 상세 페이지 항목이 히스토리에 남아
    // 브라우저 자체 뒤로가기로 다시 여기로 돌아오는 걸 막는다.
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/local-course', { replace: true });
    }
  };

  const updateCachedCourseDetail = (
    updater: (courseDetail: CourseDetailResult) => CourseDetailResult
  ) => {
    queryClient.setQueryData<CourseDetailResult>(
      ['localCourseDetail', authGeneration, courseId],
      (current) => (current ? updater(current) : current)
    );
  };

  const handleLikeError = (error: unknown) => {
    if (isNormalizedApiError(error) && error.code === 'AUTH4011') {
      clearAuth();
      openLoginModal();
      return;
    }

    showToast('좋아요 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
  };

  const handleFavoriteToggle = async (isLiked: boolean) => {
    try {
      const result = await likeMutation.mutateAsync({ courseId, isLiked });
      updateCachedCourseDetail((current) => ({
        ...current,
        isLiked: result.isLiked,
      }));
      return result.isLiked;
    } catch (error) {
      handleLikeError(error);
      return isLiked;
    }
  };

  const handlePlaceLikeToggle = async (
    placeId: number,
    isLiked: boolean,
    courseItemId: number
  ) => {
    setPendingPlaceIds((ids) => addPendingId(ids, placeId));

    try {
      const result = await placeLikeMutation.mutateAsync({
        placeId,
        isLiked,
        courseItemId,
      });
      updateCachedCourseDetail((current) => ({
        ...current,
        courseItems: current.courseItems.map((item) =>
          item.type === 'PLACE' && item.placeId === placeId
            ? { ...item, isLiked: result.isLiked }
            : item
        ),
      }));
      return result.isLiked;
    } catch (error) {
      handleLikeError(error);
      return isLiked;
    } finally {
      setPendingPlaceIds((ids) => removePendingId(ids, placeId));
    }
  };

  const handleContentLikeToggle = async (
    contentId: number,
    isLiked: boolean
  ) => {
    setPendingContentIds((ids) => addPendingId(ids, contentId));

    try {
      const result = await contentLikeMutation.mutateAsync({
        contentId,
        isLiked,
      });
      updateCachedCourseDetail((current) => ({
        ...current,
        courseItems: current.courseItems.map((item) =>
          item.type === 'CONTENT' && item.contentId === contentId
            ? { ...item, isLiked: result.isLiked }
            : item
        ),
      }));
      return result.isLiked;
    } catch (error) {
      handleLikeError(error);
      return isLiked;
    } finally {
      setPendingContentIds((ids) => removePendingId(ids, contentId));
    }
  };

  return (
    <DetailStateGuard error={null} data={course}>
      {(courseData) => (
        <CourseDetailLayout
          course={courseData}
          reviewType="local-course"
          onFavoriteToggle={handleFavoriteToggle}
          isFavoritePending={likeMutation.isPending}
          onPlaceLikeToggle={handlePlaceLikeToggle}
          onContentLikeToggle={handleContentLikeToggle}
          pendingPlaceIds={pendingPlaceIds}
          pendingContentIds={pendingContentIds}
          onBack={handleBack}
        />
      )}
    </DetailStateGuard>
  );
}

export default LocalCourseDetailPage;
