import CourseStopItem from './CourseStopItem';
import type { PlaceHours } from '../../../apis/googlePlacesHours';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useStopTravelDurations } from '../hooks/useStopTravelDurations';
import type { CourseStop } from '../types/courseDetail';

// Figma 390 디자인 기준 리터럴 px
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 4;

export interface CourseStopListProps {
  readonly stops: readonly CourseStop[];
  readonly onStopLikeToggle: (stopId: number) => void;
  readonly pendingPlaceIds?: ReadonlySet<number>;
  readonly pendingContentIds?: ReadonlySet<number>;
  readonly placeHoursByStopId?: ReadonlyMap<string | number, PlaceHours>;
  readonly className?: string;
}

export function CourseStopList({
  stops,
  onStopLikeToggle,
  pendingPlaceIds = new Set<number>(),
  pendingContentIds = new Set<number>(),
  placeHoursByStopId = new Map<string | number, PlaceHours>(),
  className = '',
}: CourseStopListProps) {
  const scale = useGlobalScale();
  const travelDurationsByStopId = useStopTravelDurations(stops);

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
          placeHours={placeHoursByStopId.get(stop.id)}
          carDurationMinutes={travelDurationsByStopId.get(stop.id)?.carMinutes}
          transitDurationMinutes={
            travelDurationsByStopId.get(stop.id)?.transitMinutes
          }
        />
      ))}
    </div>
  );
}

export default CourseStopList;
