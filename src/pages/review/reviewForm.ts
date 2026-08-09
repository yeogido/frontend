export const MAX_REVIEW_PHOTOS = 5;

/** 별점을 고르지 않은 상태의 기본값. 작성 화면과 수정 모달이 함께 쓴다. */
export const DEFAULT_REVIEW_RATING = 5;

/** Swagger의 content maxLength와 같아야 한다(작성·수정 요청 모두 300). */
export const REVIEW_CONTENT_MAX_LENGTH = 300;

/** 작성 화면과 수정 모달이 같은 안내를 보여주도록 문구를 한곳에 둔다. */
export const REVIEW_CONTENT_PLACEHOLDER =
  '이 코스는 어땠나요?\n좋았던 점, 아쉬웠던 점을 자유롭게 작성해 주세요.';

interface ReviewFormValues {
  rating: number | null;
  review: string;
  photoCount: number;
}

export function getSelectedReviewPhotos(files: Iterable<File>): File[] {
  return appendSelectedReviewPhotos([], files);
}

export function appendSelectedReviewPhotos(
  existingFiles: Iterable<File>,
  newFiles: Iterable<File>
): File[] {
  return [...existingFiles, ...newFiles].slice(0, MAX_REVIEW_PHOTOS);
}

export function removeSelectedReviewPhoto<T>(photos: T[], targetIndex: number): T[] {
  return photos.filter((_, index) => index !== targetIndex);
}

export function isReviewFormValid({
  rating,
  review,
  photoCount,
}: ReviewFormValues): boolean {
  return (
    Number.isInteger(rating) &&
    rating !== null &&
    rating >= 1 &&
    rating <= 5 &&
    review.trim().length > 0 &&
    review.length <= REVIEW_CONTENT_MAX_LENGTH &&
    // 사진은 선택이다. 서버도 images 최소 개수를 두지 않는다(minItems: 0).
    Number.isInteger(photoCount) &&
    photoCount >= 0 &&
    photoCount <= MAX_REVIEW_PHOTOS
  );
}
