const DOT_SIZE = 4;
const DOT_ACTIVE_WIDTH = 20;

export function getReviewCarouselIndicatorSize(isActive: boolean, scale: number) {
  return {
    width: (isActive ? DOT_ACTIVE_WIDTH : DOT_SIZE) * scale,
    height: DOT_SIZE * scale,
  };
}
