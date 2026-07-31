import CourseStopItem from './CourseStopItem';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import type { CourseStop } from '../types/courseDetail';

// Figma 390 디자인 기준 리터럴 px
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 4;

export interface CourseStopListProps {
  readonly stops: readonly CourseStop[];
  readonly onStopLikeToggle: (stopId: number) => void;
  readonly pendingPlaceId?: number | null;
  readonly pendingContentId?: number | null;
  readonly className?: string;
}

export function CourseStopList({
  stops,
  onStopLikeToggle,
  pendingPlaceId = null,
  pendingContentId = null,
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
            stop.placeId === pendingPlaceId || stop.contentId === pendingContentId
          }
        />
      ))}
    </div>
  );
}

export default CourseStopList;
