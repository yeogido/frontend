import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getApiErrorMessage } from '../../apis/common';
import backIcon from '../../assets/icons/vector.svg';
import { ResponsivePageShell } from '../../components/layout';
import { useToast } from '../../components/toast';
import { useCourseDetail } from '../../hooks/useCourses';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useCreateCourseReview } from '../../hooks/useReviews';

import { mapCourseDetailToReviewCourse } from './reviewCourse';
import {
  PhotoUploader,
  ReviewCourseCard,
  ReviewHeader,
  ReviewRatingSection,
  ReviewTextArea,
  ReviewTipBanner,
  SelectedPhotoSection,
} from './components';
import {
  appendSelectedReviewPhotos,
  getSelectedReviewPhotos,
  isReviewFormValid,
  MAX_REVIEW_PHOTOS,
  removeSelectedReviewPhoto,
} from './reviewForm';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 16;
const PAGE_PADDING_BOTTOM = 32;
const BACK_BUTTON_SIZE = 24;
const BACK_ICON_SIZE = 24;
const SUBMIT_BUTTON_MARGIN_TOP = 90;
const SUBMIT_BUTTON_HEIGHT = 53;
const SUBMIT_BUTTON_FONT_SIZE = 16;
const SUBMIT_BUTTON_RADIUS = 12;

export type ReviewTargetType =
  | 'yeogido-course'
  | 'local-recommendation'
  | 'local-course'
  | 'local-business'
  | string;

// 리뷰 작성 API는 추천 코스(GET/POST /courses/{courseId}/reviews)만 지원한다.
const REVIEWABLE_TARGET_TYPES = ['yeogido-course', 'local-course'] as const;

function isReviewableTargetType(
  targetType: ReviewTargetType
): targetType is (typeof REVIEWABLE_TARGET_TYPES)[number] {
  return REVIEWABLE_TARGET_TYPES.some((type) => type === targetType);
}

function ReviewPage() {
  const [searchParams] = useSearchParams();

  // 대상의 유형(type)과 ID(id)를 쿼리 스트링에서 읽어옴
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

  const { data: courseDetail, isPending } = useCourseDetail(courseId);
  // courseId가 없으면 쿼리가 비활성이라 isPending이 계속 true로 남는다.
  const isLoadingCourse = courseId !== null && isPending;
  const course = courseDetail
    ? mapCourseDetailToReviewCourse(courseDetail)
    : null;

  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<
    Array<{ file: File; previewUrl: string }>
  >([]);
  const photoPickerRef = useRef<HTMLInputElement>(null);
  const selectedPhotosRef = useRef(selectedPhotos);
  const { showToast } = useToast();
  const createReview = useCreateCourseReview();
  const isMaxPhotosReached = selectedPhotos.length >= MAX_REVIEW_PHOTOS;
  const canSubmit = isReviewFormValid({
    rating,
    review,
    photoCount: selectedPhotos.length,
  });
  const isSubmittable =
    canSubmit && !isLoadingCourse && !createReview.isPending;

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
    if (!canSubmit || createReview.isPending) return;

    // 추천 코스 외의 대상(소상공인 등)은 아직 후기 API가 없어 저장하지 않는다.
    if (courseId === null || rating === null) {
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

  const navigate = useNavigate();
  const scale = useGlobalScale();
  const backButtonSize = BACK_BUTTON_SIZE * scale;
  const scaledBackButtonSize = BACK_BUTTON_SIZE * scale;
  const backButtonOverlap = (backButtonSize - scaledBackButtonSize) / -2;

  return (
    <ResponsivePageShell
      mode="standalone"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-white"
    >
      <button
        type="button"
        aria-label="이전 페이지로 이동"
        onClick={() => navigate(-1)}
        className="text-gray-5 flex items-center justify-center"
        style={{
          width: backButtonSize,
          height: backButtonSize,
          marginLeft: backButtonOverlap,
          marginTop: backButtonOverlap,
        }}
      >
        <img
          src={backIcon}
          alt=""
          aria-hidden="true"
          style={{
            width: BACK_ICON_SIZE * scale,
            height: BACK_ICON_SIZE * scale,
            transform: 'rotate(180deg)',
          }}
        />
      </button>
      <form onSubmit={handleSubmit}>
        <ReviewHeader />
        {course && <ReviewCourseCard course={course} />}

        <PhotoUploader
          inputRef={photoPickerRef}
          onChange={handlePhotoChange}
          disabled={isMaxPhotosReached}
        />

        <SelectedPhotoSection
          photos={selectedPhotos}
          onOpenPicker={openPhotoPicker}
          onRemovePhoto={handleRemovePhoto}
        />

        <ReviewRatingSection value={rating} onChange={setRating} />

        <ReviewTextArea
          value={review}
          onChange={(event) => setReview(event.target.value)}
        />

        <ReviewTipBanner />

        <button
          type="submit"
          disabled={!isSubmittable}
          className={`w-full font-semibold transition-colors disabled:cursor-not-allowed ${
            isSubmittable ? 'bg-main-5 text-white' : 'bg-gray-2 text-gray-4'
          }`}
          style={{
            marginTop: SUBMIT_BUTTON_MARGIN_TOP * scale,
            height: SUBMIT_BUTTON_HEIGHT * scale,
            borderRadius: SUBMIT_BUTTON_RADIUS * scale,
            fontSize: SUBMIT_BUTTON_FONT_SIZE * scale,
          }}
        >
          {createReview.isPending ? '등록 중...' : '후기 남기기'}
        </button>
      </form>
    </ResponsivePageShell>
  );
}

export default ReviewPage;
