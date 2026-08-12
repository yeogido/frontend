import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getApiErrorMessage } from '../../../apis/common';
import { useToast } from '../../../components/toast';
import { useCourseSummary } from '../../../hooks/useCourses';
import { useCreateCourseReview } from '../../../hooks/useReviews';
import {
  appendSelectedReviewPhotos,
  DEFAULT_REVIEW_RATING,
  getSelectedReviewPhotos,
  isReviewFormValid,
  MAX_REVIEW_PHOTOS,
  removeSelectedReviewPhoto,
} from '../../../utils/reviewForm';
import { mapCourseSummaryToReviewCourse } from '../mappers/reviewCourse';
import {
  isReviewableTargetType,
  type ReviewTargetType,
} from '../constants/reviewTarget';

/**
 * 후기 작성 화면의 대상 해석·폼 상태·제출을 모은다. 화면은 이 훅이
 * 돌려주는 값만 그린다.
 */
export function useReviewForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createReview = useCreateCourseReview();

  // 대상의 유형(type)과 ID(id)를 쿼리 스트링에서 읽어온다.
  const targetType = (searchParams.get('type') ||
    searchParams.get('targetType') ||
    'yeogido-course') as ReviewTargetType;
  const targetId =
    searchParams.get('id') ||
    searchParams.get('targetId') ||
    searchParams.get('courseId');

  const isReviewableTarget = isReviewableTargetType(targetType);
  const parsedCourseId = Number(targetId);
  const courseId =
    isReviewableTarget && targetId && Number.isInteger(parsedCourseId)
      ? parsedCourseId
      : null;

  const {
    data: courseSummary,
    isPending,
    isError: isCourseError,
  } = useCourseSummary(courseId);
  // courseId가 없으면 쿼리가 비활성이라 isPending이 계속 true로 남는다.
  const isLoadingCourse = courseId !== null && isPending;
  const course = courseSummary
    ? mapCourseSummaryToReviewCourse(courseSummary)
    : null;

  // 수정 모달과 마찬가지로 5점에서 시작한다. 0개로 두면 별점을 안 건드린
  // 사람이 제출 버튼이 왜 비활성인지 알기 어렵다.
  const [rating, setRating] = useState<number | null>(DEFAULT_REVIEW_RATING);
  const [review, setReview] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<
    Array<{ file: File; previewUrl: string }>
  >([]);
  const photoPickerRef = useRef<HTMLInputElement>(null);
  const selectedPhotosRef = useRef(selectedPhotos);

  const isMaxPhotosReached = selectedPhotos.length >= MAX_REVIEW_PHOTOS;
  const canSubmit = isReviewFormValid({
    rating,
    review,
    photoCount: selectedPhotos.length,
  });
  // 어느 코스에 다는 후기인지 확인되기 전에는 보낼 수 없다. 코스를 못 찾은
  // 상태에서 눌리면 작성한 내용이 그대로 날아간다.
  const isSubmittable =
    canSubmit && course !== null && !isLoadingCourse && !createReview.isPending;

  useEffect(() => {
    selectedPhotosRef.current = selectedPhotos;
  }, [selectedPhotos]);

  useEffect(() => {
    return () => {
      selectedPhotosRef.current.forEach(({ previewUrl }) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, []);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = getSelectedReviewPhotos(event.currentTarget.files ?? []);

    if (files.length === 0 || isMaxPhotosReached) {
      event.currentTarget.value = '';
      return;
    }

    setSelectedPhotos((currentPhotos) => {
      const remainingSlots = MAX_REVIEW_PHOTOS - currentPhotos.length;
      if (remainingSlots <= 0) return currentPhotos;

      const mergedFiles = appendSelectedReviewPhotos(
        currentPhotos.map(({ file }) => file),
        files
      );
      const addedFiles = mergedFiles.slice(currentPhotos.length);

      return [
        ...currentPhotos,
        ...addedFiles.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ];
    });

    event.currentTarget.value = '';
  };

  const handleRemovePhoto = (targetIndex: number) => {
    setSelectedPhotos((currentPhotos) => {
      const photoToRemove = currentPhotos[targetIndex];
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }
      return removeSelectedReviewPhoto(currentPhotos, targetIndex);
    });
  };

  const openPhotoPicker = () => {
    if (isMaxPhotosReached) return;
    photoPickerRef.current?.click();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSubmittable || rating === null) return;

    // 추천 코스 외의 대상(소상공인 등)은 아직 후기 API가 없어 저장하지 않는다.
    if (courseId === null) {
      navigate(-1);
      return;
    }

    try {
      await createReview.mutateAsync({
        courseId,
        rating,
        content: review.trim(),
        photos: selectedPhotos.map(({ file }) => file),
      });

      navigate(`/${targetType}/detail/${courseId}`, { replace: true });
    } catch (error) {
      showToast(getApiErrorMessage(error, '후기를 등록하지 못했습니다.'));
    }
  };

  return {
    course,
    isCourseError,
    isLoadingCourse,
    isReviewableTarget,
    rating,
    setRating,
    review,
    setReview,
    selectedPhotos,
    photoPickerRef,
    isMaxPhotosReached,
    isSubmittable,
    isSubmitting: createReview.isPending,
    handlePhotoChange,
    handleRemovePhoto,
    openPhotoPicker,
    handleSubmit,
  };
}

export default useReviewForm;
