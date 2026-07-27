export function getCourseReviewIndex(
  scrollLeft: number,
  itemWidth: number,
  reviewCount: number
) {
  if (itemWidth <= 0 || reviewCount <= 0) {
    return 0;
  }

  return Math.min(
    Math.max(Math.round(scrollLeft / itemWidth), 0),
    reviewCount - 1
  );
}
