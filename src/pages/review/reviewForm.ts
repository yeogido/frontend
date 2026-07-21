export const MAX_REVIEW_PHOTOS = 5;

interface ReviewFormValues {
  rating: number;
  review: string;
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

export function isReviewFormValid({ rating, review }: ReviewFormValues): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 && review.trim().length > 0;
}
