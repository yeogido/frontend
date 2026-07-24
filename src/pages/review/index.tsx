import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';

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

  const [rating, setRating] = useState(3);
  const [review, setReview] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<
    Array<{ file: File; previewUrl: string }>
  >([]);
  const photoPickerRef = useRef<HTMLInputElement>(null);
  const selectedPhotosRef = useRef(selectedPhotos);
  const isMaxPhotosReached = selectedPhotos.length >= MAX_REVIEW_PHOTOS;
  const canSubmit = isReviewFormValid({ rating, review });

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
    return () => {
      selectedPhotosRef.current.forEach(({ previewUrl }) =>
        URL.revokeObjectURL(previewUrl)
      );
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

    // TODO: 백엔드 리뷰 작성 API 연동 (POST /api/reviews)
    // payload: { targetType, targetId, rating, review, photos: selectedPhotos }
  };

  const navigate = useNavigate();

  return (
    <main className="relative z-[60] mx-auto -mt-14 min-h-dvh w-full max-w-[500px] bg-white px-6 pt-[59px] pb-8">
      <button
        type="button"
        aria-label="이전 페이지로 이동"
        onClick={() => navigate(-1)}
        className="text-gray-5 mt-15 flex size-6 items-center justify-center"
      >
        <IoChevronBack aria-hidden="true" className="text-[24px]" />
      </button>
      <form onSubmit={handleSubmit}>
        <ReviewHeader />
        <ReviewCourseCard
          title={courseData?.title}
          image={courseData?.image}
          duration={courseData?.duration}
          courseType={courseData?.courseType}
          companion={courseData?.companion}
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
          className={`mt-[90px] h-[53px] w-full rounded-xl text-base font-semibold transition-colors disabled:cursor-not-allowed ${
            canSubmit && !isLoadingCourse ? 'bg-main-5 text-white' : 'bg-gray-2 text-gray-4'
          }`}
        >
          후기 남기기
        </button>
      </form>
    </main>
  );
}

export default ReviewPage;
