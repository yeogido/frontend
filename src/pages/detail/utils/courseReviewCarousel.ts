export function getCourseReviewIndex(
  scrollLeft: number,
  itemWidth: number,
  reviewCount: number,
  itemGap = 0
) {
  const scrollStep = itemWidth + itemGap;

  if (scrollStep <= 0 || reviewCount <= 0) {
    return 0;
  }

  return Math.min(
    Math.max(Math.round(scrollLeft / scrollStep), 0),
    reviewCount - 1
  );
}
