import CourseStopItem from './CourseStopItem';
import type { CourseStop } from '../types/courseDetail';

export interface CourseStopListProps {
  readonly stops: readonly CourseStop[];
  readonly onStopLikeToggle?: (stopId: number) => void;
  readonly className?: string;
}

export function CourseStopList({
  stops,
  onStopLikeToggle,
  className = '',
}: CourseStopListProps) {
  return (
    <div className={`mt-3 space-y-1 ${className}`}>
      {stops.map((stop, index) => (
        <CourseStopItem
          key={stop.id}
          stop={stop}
          isLast={index === stops.length - 1}
          onLikeToggle={onStopLikeToggle ? () => onStopLikeToggle(stop.id) : undefined}
        />
      ))}
    </div>
  );
}

export default CourseStopList;
