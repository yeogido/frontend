import { useNavigate } from 'react-router-dom';

import backIcon from '../../assets/icons/vector.svg';
import { ResponsivePageShell } from '../../components/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';

import {
  PhotoUploader,
  ReviewCourseCard,
  ReviewHeader,
  ReviewRatingSection,
  ReviewTextArea,
  ReviewTipBanner,
  SelectedPhotoSection,
} from './components';
import { useReviewForm } from './hooks/useReviewForm';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 16;
const PAGE_PADDING_BOTTOM = 32;
const BACK_BUTTON_SIZE = 24;
const BACK_ICON_SIZE = 24;
const SUBMIT_BUTTON_MARGIN_TOP = 90;
const SUBMIT_BUTTON_HEIGHT = 53;
const SUBMIT_BUTTON_FONT_SIZE = 16;
const SUBMIT_BUTTON_RADIUS = 12;

function ReviewPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const {
    course,
    isCourseError,
    rating,
    setRating,
    review,
    setReview,
    selectedPhotos,
    photoPickerRef,
    isMaxPhotosReached,
    isSubmittable,
    isSubmitting,
    handlePhotoChange,
    handleRemovePhoto,
    openPhotoPicker,
    handleSubmit,
  } = useReviewForm();
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
        {course ? (
          <ReviewCourseCard course={course} />
        ) : isCourseError ? (
          <p
            className="text-gray-4 text-center font-medium"
            style={{ marginTop: 24 * scale, fontSize: 13 * scale }}
          >
            코스를 불러오지 못해 후기를 작성할 수 없습니다.
          </p>
        ) : null}

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
          {isSubmitting ? '등록 중...' : '후기 남기기'}
        </button>
      </form>
    </ResponsivePageShell>
  );
}

export default ReviewPage;
