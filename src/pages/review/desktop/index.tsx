import { DesktopPageShell } from '../../../components/layout/desktop';
import {
  MAX_REVIEW_PHOTOS,
  REVIEW_CONTENT_MAX_LENGTH,
  REVIEW_CONTENT_PLACEHOLDER,
} from '../../../utils/reviewForm';
import { useReviewForm } from '../hooks/useReviewForm';
import calendarIcon from './assets/calendar.svg';
import locationIcon from './assets/location.svg';
import personIcon from './assets/person.svg';
import cameraIcon from './assets/camera.svg';
import addIcon from './assets/add.svg';
import starFilled from './assets/star-filled.svg';
import starEmpty from './assets/star-empty.svg';
import tipIcon from './assets/tip.svg';

/** Figma 6360:43514. 모바일과 대상 조회, 사진 관리 및 제출 로직을 공유한다. */
function ReviewDesktopPage() {
  const {
    course,
    isCourseError,
    isLoadingCourse,
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

  return (
    <DesktopPageShell>
      <form onSubmit={handleSubmit} className="flex flex-col gap-[60px]">
        <header className="flex flex-col gap-[6px]">
          <h1 className="text-[32px] font-semibold text-black">
            이번 여행은 어떠셨나요?
          </h1>
          <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
            다른 여행자에게 도움이 되는 후기를 남겨보세요
          </p>
        </header>

        <div className="flex flex-col gap-[40px]">
          {course ? (
            <section
              aria-label="리뷰할 코스"
              className="bg-background flex items-center gap-[24px] rounded-[12px] px-[12px] py-[16px]"
            >
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt=""
                  className="h-[76px] w-[103px] shrink-0 rounded-[8px] object-cover"
                />
              ) : (
                <div className="bg-gray-2 text-gray-4 flex h-[76px] w-[103px] shrink-0 items-center justify-center rounded-[8px] text-[12px]">
                  이미지 없음
                </div>
              )}
              <div className="flex min-w-0 flex-col gap-[16px]">
                <h2 className="truncate text-[20px] font-semibold text-black">
                  {course.title}
                </h2>
                <div className="text-gray-4 flex flex-wrap items-center gap-[8px] text-[16px] font-medium">
                  {[
                    [calendarIcon, course.duration],
                    [locationIcon, course.transport],
                    [personIcon, course.companion],
                  ].map(([icon, label]) =>
                    label ? (
                      <span key={label} className="flex items-center gap-[2px]">
                        <img src={icon} alt="" />
                        {label}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            </section>
          ) : isLoadingCourse ? (
            <p role="status" className="text-gray-4 text-[16px]">
              코스를 불러오는 중이에요.
            </p>
          ) : (
            <p role="alert" className="text-gray-4 text-[16px]">
              {isCourseError
                ? '코스를 불러오지 못해 후기를 작성할 수 없습니다.'
                : '후기를 작성할 코스를 확인해 주세요.'}
            </p>
          )}

          <section
            aria-labelledby="desktop-photo-upload-title"
            className="flex flex-col gap-[20px]"
          >
            <h2
              id="desktop-photo-upload-title"
              className="text-[20px] font-semibold text-black"
            >
              후기 사진 등록
            </h2>
            <input
              ref={photoPickerRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              disabled={isMaxPhotosReached}
              className="sr-only"
              aria-label="후기 사진 선택"
            />
            <button
              type="button"
              onClick={openPhotoPicker}
              disabled={isMaxPhotosReached}
              className="border-main-5 bg-main-1 flex h-[272px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="bg-main-3 flex size-[51px] items-center justify-center rounded-full">
                <img src={cameraIcon} alt="" />
              </span>
              <strong className="mt-[18px] text-[20px] font-semibold">
                {isMaxPhotosReached
                  ? '최대 사진 개수(5장)에 도달했어요'
                  : '사진을 추가해 주세요. (선택)'}
              </strong>
              <span className="mt-[12px] text-[16px]">
                {isMaxPhotosReached
                  ? '기존 사진을 지우면 새 사진을 추가할 수 있어요.'
                  : '여기를 눌러 업로드할 수 있어요.'}
              </span>
            </button>
          </section>

          <section
            aria-labelledby="desktop-selected-photo-title"
            className="flex flex-col gap-[20px]"
          >
            <div className="flex items-center justify-between gap-[12px]">
              <h2
                id="desktop-selected-photo-title"
                className="text-[20px] font-semibold text-black"
              >
                선택된 사진{' '}
                <span className="text-gray-4 font-medium">
                  ({selectedPhotos.length}/{MAX_REVIEW_PHOTOS})
                </span>
              </h2>
              <p className="text-gray-4 text-[16px]">
                최대 {MAX_REVIEW_PHOTOS}장까지 선택할 수 있어요.
              </p>
            </div>
            <div className="grid grid-cols-5 gap-[24px]">
              {Array.from({ length: MAX_REVIEW_PHOTOS }, (_, index) => {
                const photo = selectedPhotos[index];
                return photo ? (
                  <div
                    key={photo.previewUrl}
                    className="bg-background relative aspect-square overflow-hidden rounded-[12px]"
                  >
                    <img
                      src={photo.previewUrl}
                      alt={`선택한 사진 ${index + 1}`}
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`사진 ${index + 1} 삭제`}
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-[4px] right-[4px] flex size-[36px] items-center justify-center rounded-full bg-black/60 text-[24px] text-white"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    key={index}
                    type="button"
                    onClick={openPhotoPicker}
                    aria-label={`사진 ${index + 1} 추가`}
                    className="bg-gray-2 flex aspect-square items-center justify-center rounded-[12px]"
                  >
                    <img src={addIcon} alt="" />
                  </button>
                );
              })}
            </div>
          </section>

          <section
            aria-labelledby="desktop-rating-title"
            className="flex flex-col gap-[20px]"
          >
            <h2
              id="desktop-rating-title"
              className="text-[20px] font-semibold text-black"
            >
              별점을 남겨주세요
            </h2>
            <div>
              <div role="group" aria-label="별점 선택" className="flex">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value}점`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                    className="flex size-[80px] items-center justify-center"
                  >
                    <img
                      src={
                        rating !== null && value <= rating
                          ? starFilled
                          : starEmpty
                      }
                      alt=""
                    />
                  </button>
                ))}
              </div>
              <p className="text-gray-4 mt-[12px] text-[16px]">
                이 코스를 얼마나 만족하셨나요?
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-[20px]">
            <label
              htmlFor="desktop-review-text"
              className="text-[20px] font-semibold text-black"
            >
              총평을 남겨주세요
            </label>
            <div className="border-gray-2 focus-within:border-main-5 flex h-[148px] flex-col rounded-[12px] border bg-white px-[16px] pt-[20px] pb-[10px]">
              <textarea
                id="desktop-review-text"
                value={review}
                onChange={(event) => setReview(event.target.value)}
                maxLength={REVIEW_CONTENT_MAX_LENGTH}
                placeholder={REVIEW_CONTENT_PLACEHOLDER}
                className="placeholder:text-gray-4 min-h-0 w-full flex-1 resize-none bg-transparent text-[16px] outline-none"
              />
              <span className="text-gray-4 text-right text-[14px]">
                {review.length}/{REVIEW_CONTENT_MAX_LENGTH}
              </span>
            </div>
          </section>

          <aside className="bg-main-2 text-main-5 flex items-center gap-[16px] rounded-[12px] px-[16px] py-[20px]">
            <span className="bg-main-5 flex size-[28px] shrink-0 items-center justify-center rounded-full">
              <img src={tipIcon} alt="" />
            </span>
            <p className="text-[16px]">
              다른 여행자에게 도움이 되는 후기를 작성해 보세요!
              <br />
              솔직한 경험이 더 좋은 여행을 만들어줘요
            </p>
          </aside>
        </div>

        <button
          type="submit"
          disabled={!isSubmittable}
          className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 h-[61px] w-full rounded-[12px] text-[24px] font-semibold text-white disabled:cursor-not-allowed"
        >
          {isSubmitting ? '등록 중...' : '후기 등록하기'}
        </button>
      </form>
    </DesktopPageShell>
  );
}

export default ReviewDesktopPage;
