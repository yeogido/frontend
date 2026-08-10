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
  const { openLoginModal } = useLoginModal();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const parsedCourseId = Number(courseIdParam);
  const courseId =
    Boolean(courseIdParam && /^\d+$/.test(courseIdParam)) &&
    Number.isSafeInteger(parsedCourseId) &&
    parsedCourseId > 0
      ? parsedCourseId
      : null;
  const { data, isError } = useLocalCourseDetail(courseId);
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
    return <NotFoundPage />;
  }

  const updateCachedCourseDetail = (
    updater: (courseDetail: CourseDetailResult) => CourseDetailResult
  ) => {
    queryClient.setQueryData<CourseDetailResult>(
      ['localCourseDetail', courseId],
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
          onBack={() => navigate('/local-course')}
        />
      )}
    </DetailStateGuard>
  );
}

export default LocalCourseDetailPage;
