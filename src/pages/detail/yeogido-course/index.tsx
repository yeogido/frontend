import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import type { CourseDetailResult } from '../../../apis/courses';
import type { NormalizedApiError } from '../../../apis/common';
import { useToast } from '../../../components/toast';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useAuthStore } from '../../../store/auth.store';
import { NotFoundPage } from '../../not-found';
import { saveRecentCourse } from '../../../utils/recentCourses';
import { CourseDetailLayout, DetailStateGuard } from '../components';
import {
  mapCourseApiDetailToCourseSummary,
  mapCourseApiDetailToDto,
} from '../mappers/courseApiDetailMapper';
import { mapCourseDetailDtoToViewModel } from '../mappers/courseDetailMapper';
import {
  useYeogidoCourseDetail,
  useYeogidoCourseLikeMutation,
  useContentLikeMutation,
  usePlaceLikeMutation,
} from './useYeogidoCourseDetail';

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

function YeogidoCourseDetailPage() {
  const { courseId: courseIdParam } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
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
  const { data, isLoadingError } = useYeogidoCourseDetail(courseId);
  const likeMutation = useYeogidoCourseLikeMutation();
  const placeLikeMutation = usePlaceLikeMutation();
  const contentLikeMutation = useContentLikeMutation();
  const [pendingPlaceIds, setPendingPlaceIds] = useState<ReadonlySet<number>>(
    () => new Set()
  );
  const [pendingContentIds, setPendingContentIds] = useState<
    ReadonlySet<number>
  >(() => new Set());

  useEffect(() => {
    // courseId가 바뀌면 이전 코스의 좋아요 대기 상태가 남지 않도록 초기화한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingPlaceIds(new Set());
    setPendingContentIds(new Set());
  }, [courseId]);

  const course = useMemo(() => {
    if (!data || data.courseType !== 'OFFICIAL') {
      return null;
    }

    try {
      return mapCourseDetailDtoToViewModel(mapCourseApiDetailToDto(data));
    } catch {
      return null;
    }
  }, [data]);

  useEffect(() => {
    if (!data || data.courseType !== 'OFFICIAL') return;

    saveRecentCourse({
      ...mapCourseApiDetailToCourseSummary(data),
      courseType: 'OFFICIAL',
    });
  }, [data]);

  if (courseId === null || isLoadingError || (data && !course)) {
    return <NotFoundPage />;
  }

  const handleBack = () => {
    // history.state.idx는 react-router의 브라우저 히스토리 항목 인덱스라,
    // 0이면 이 탭에서 처음 들어온 화면(직접 링크로 진입 등)이라 뒤로 갈
    // 곳이 없다 — 그때만 여기도 코스 목록으로 대체 이동한다. 그 외에는
    // 실제로 들어온 경로(코스 검색, 행사에 포함된 코스 등)로 돌아간다.
    // 대체 이동은 replace로 해서, 이 상세 페이지 항목이 히스토리에 남아
    // 브라우저 자체 뒤로가기로 다시 여기로 돌아오는 걸 막는다.
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/yeogido-course', { replace: true });
    }
  };

  const updateCachedCourseDetail = (
    updater: (courseDetail: CourseDetailResult) => CourseDetailResult
  ) => {
    queryClient.setQueryData<CourseDetailResult>(
      ['yeogidoCourseDetail', authGeneration, courseId],
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
          reviewType="yeogido-course"
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

export default YeogidoCourseDetailPage;
