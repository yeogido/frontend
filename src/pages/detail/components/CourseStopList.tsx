import CourseStopItem from './CourseStopItem';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import type { CourseStop } from '../types/courseDetail';

// Figma 390 디자인 기준 리터럴 px
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 4;

export interface CourseStopListProps {
  readonly stops: readonly CourseStop[];
  readonly onStopLikeToggle: (stopId: number) => void;
  readonly pendingPlaceIds?: ReadonlySet<number>;
  readonly pendingContentIds?: ReadonlySet<number>;
  readonly className?: string;
}

export function CourseStopList({
  stops,
  onStopLikeToggle,
  pendingPlaceIds = new Set<number>(),
  pendingContentIds = new Set<number>(),
  className = '',
}: CourseStopListProps) {
  const scale = useGlobalScale();

  return (
    <div
      className={`flex flex-col ${className}`}
      style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
    >
      {stops.map((stop, index) => (
        <CourseStopItem
          key={stop.id}
          stop={stop}
          isLast={index === stops.length - 1}
          onLikeToggle={() => onStopLikeToggle(stop.id)}
          isLikeAvailable={
            stop.placeId !== undefined || stop.contentId !== undefined
          }
          isLikePending={
            (stop.placeId !== undefined && pendingPlaceIds.has(stop.placeId)) ||
            (stop.contentId !== undefined &&
              pendingContentIds.has(stop.contentId))
          }
        />
      ))}
    </div>
  );
}

export default CourseStopList;
