export const MAX_REVIEW_PHOTOS = 5;

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
    review.length <= 300 &&
    photoCount > 0
  );
}
