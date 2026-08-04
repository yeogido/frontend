import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import backIcon from '../../assets/icons/vector.svg';
import { ResponsivePageShell } from '../../components/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import {
  useSubmittedCourseReviewsStore,
  type SubmittedCourseReviewType,
} from '../../store/submitted-course-reviews.store';

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

interface CourseData {
  title: string;
  image?: string;
  duration?: string;
  courseType?: string;
  companion?: string;
  type?: ReviewTargetType;
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

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(Boolean(targetId));

  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<
    Array<{ file: File; previewUrl: string }>
  >([]);
  const photoPickerRef = useRef<HTMLInputElement>(null);
  const selectedPhotosRef = useRef(selectedPhotos);
  const submittedPhotoUrlsRef = useRef(new Set<string>());
  const addSubmittedReview = useSubmittedCourseReviewsStore(
    (state) => state.addReview
  );
  const isMaxPhotosReached = selectedPhotos.length >= MAX_REVIEW_PHOTOS;
  const canSubmit = isReviewFormValid({
    rating,
    review,
    photoCount: selectedPhotos.length,
  });

  // targetType 및 targetId에 맞춰 코스/장소 데이터 API 조회
  useEffect(() => {
    if (!targetId) return;

    // TODO: 백엔드 API 연동 시 targetType별 분기 처리
    // 예: targetType === 'local-recommendation' ? fetchLocalRecommendation(targetId) : fetchYeogidoCourse(targetId)
    const timer = setTimeout(() => {
      if (targetType === 'local-recommendation') {
        setCourseData({
          title: '로컬 추천 산책 코스',
          duration: '당일치기',
          courseType: '추천 코스',
          companion: '친구와 함께',
          type: targetType,
        });
      } else {
        setCourseData({
          title: '강릉 혼자 여행 코스',
          duration: '2박 3일',
          courseType: '뚜벅이 코스',
          companion: '혼자',
          type: targetType,
        });
      }
      setIsLoadingCourse(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [targetType, targetId]);

  useEffect(() => {
    selectedPhotosRef.current = selectedPhotos;
  }, [selectedPhotos]);

  useEffect(() => {
    const submittedPhotoUrls = submittedPhotoUrlsRef.current;

    return () => {
      selectedPhotosRef.current.forEach(({ previewUrl }) => {
        if (!submittedPhotoUrls.has(previewUrl)) {
          URL.revokeObjectURL(previewUrl);
        }
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    if (
      targetId &&
      (targetType === 'yeogido-course' || targetType === 'local-course') &&
      rating !== null
    ) {
      selectedPhotos.forEach(({ previewUrl }) =>
        submittedPhotoUrlsRef.current.add(previewUrl)
      );
      addSubmittedReview({
        courseType: targetType as SubmittedCourseReviewType,
        courseId: targetId,
        images: selectedPhotos.map(({ previewUrl }) => previewUrl),
        content: review.trim(),
        rating,
      });
      navigate(`/${targetType}/detail/${targetId}`, { replace: true });
      return;
    }

    navigate(-1);

    // TODO: 백엔드 리뷰 작성 API 연동 (POST /api/reviews)
    // payload: { targetType, targetId, rating, review, photos: selectedPhotos }
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
        <ReviewCourseCard
          course={{
            id: targetId ?? 'fallback',
            title: courseData?.title ?? '강릉 혼자 여행 코스',
            thumbnailUrl: courseData?.image,
            duration: courseData?.duration ?? '2박 3일',
            transport: courseData?.courseType ?? '뚜벅이 코스',
            companion: courseData?.companion ?? '혼자',
          }}
        />

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
          disabled={!canSubmit || isLoadingCourse}
          className={`w-full font-semibold transition-colors disabled:cursor-not-allowed ${
            canSubmit && !isLoadingCourse
              ? 'bg-main-5 text-white'
              : 'bg-gray-2 text-gray-4'
          }`}
          style={{
            marginTop: SUBMIT_BUTTON_MARGIN_TOP * scale,
            height: SUBMIT_BUTTON_HEIGHT * scale,
            borderRadius: SUBMIT_BUTTON_RADIUS * scale,
            fontSize: SUBMIT_BUTTON_FONT_SIZE * scale,
          }}
        >
          후기 남기기
        </button>
      </form>
    </ResponsivePageShell>
  );
}

export default ReviewPage;
