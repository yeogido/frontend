export const SHEET_SNAP_RATIOS = [0.3, 0.6, 0.9] as const;
export const FLICK_VELOCITY_THRESHOLD = 0.55;
const BOUNDARY_RESISTANCE_RATIO = 0.25;

export const getSnapHeights = (viewportHeight: number): number[] =>
  SHEET_SNAP_RATIOS.map((ratio) => viewportHeight * ratio);

interface ResolveSnapIndexParams {
  height: number;
  velocityY: number;
  currentIndex: number;
  snapHeights: readonly number[];
}

export const resolveSnapIndex = ({
  height,
  velocityY,
  currentIndex,
  snapHeights,
}: ResolveSnapIndexParams): number => {
  const lastIndex = snapHeights.length - 1;

  if (Math.abs(velocityY) >= FLICK_VELOCITY_THRESHOLD) {
    const direction = velocityY < 0 ? 1 : -1;

    return Math.min(lastIndex, Math.max(0, currentIndex + direction));
  }

  return snapHeights.reduce(
    (nearestIndex, snapHeight, index) =>
      Math.abs(snapHeight - height) <
      Math.abs(snapHeights[nearestIndex] - height)
        ? index
        : nearestIndex,
    0
  );
};

export const applyBoundaryResistance = (
  height: number,
  minimumHeight: number,
  maximumHeight: number
) => {
  if (height < minimumHeight) {
    return minimumHeight - (minimumHeight - height) * BOUNDARY_RESISTANCE_RATIO;
  }

  if (height > maximumHeight) {
    return maximumHeight + (height - maximumHeight) * BOUNDARY_RESISTANCE_RATIO;
  }

  return height;
};
