/** 홈 히어로·최근 후기 캐러셀 카드 사이의 Figma 기준 간격. */
export const HOME_CAROUSEL_CARD_GAP = 12;

export const getHomeCarouselIndex = (
  scrollLeft: number,
  itemWidth: number,
  scale: number,
  itemCount: number,
) => {
  const itemStep = itemWidth + HOME_CAROUSEL_CARD_GAP * scale;

  if (itemStep <= 0 || itemCount <= 0) return 0;

  return Math.min(Math.max(Math.round(scrollLeft / itemStep), 0), itemCount - 1);
};
