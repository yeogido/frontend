import { useId, useState } from 'react';
import dayChevronIcon from '../../../assets/icons/course-day-chevron.svg';
import CourseStopItem from './CourseStopItem';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import {
  getCourseDayLabel,
  groupCourseStopsByDay,
} from '../../../utils/courseDetail';
import type { CourseStop } from '../types/courseDetail';

// Figma 390 디자인 기준 리터럴 px
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 4;

export interface CourseStopListProps {
  readonly stops: readonly CourseStop[];
  readonly onStopLikeToggle: (stopId: number) => void;
  readonly onStopFocus?: (stopId: number) => void;
  readonly pendingPlaceIds?: ReadonlySet<number>;
  readonly pendingContentIds?: ReadonlySet<number>;
  readonly className?: string;
}

export function CourseStopList({
  stops,
  onStopLikeToggle,
  onStopFocus,
  pendingPlaceIds = new Set<number>(),
  pendingContentIds = new Set<number>(),
  className = '',
}: CourseStopListProps) {
  const scale = useGlobalScale();
  const listId = useId();
  const [collapsedDays, setCollapsedDays] = useState<ReadonlySet<number>>(
    new Set()
  );
  const days = groupCourseStopsByDay(stops);

  const toggleDay = (day: number) => {
    setCollapsedDays((previous) => {
      const next = new Set(previous);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  return (
    <div
      className={`flex flex-col ${className}`}
      style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
    >
      {days.map(({ day, stops: dayStops }) => {
        const isExpanded = !collapsedDays.has(day);
        const panelId = `${listId}-day-${day}`;
        const headingId = `${panelId}-heading`;

        return (
          <section key={day}>
            <h2>
              <button
                id={headingId}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggleDay(day)}
                className="flex w-full cursor-pointer items-center text-left font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  minHeight: 44 * scale,
                  gap: 8 * scale,
                  fontSize: 16 * scale,
                }}
              >
                {getCourseDayLabel(day)}
                <img
                  src={dayChevronIcon}
                  alt=""
                  aria-hidden="true"
                  className="shrink-0 transition-transform motion-reduce:transition-none"
                  style={{
                    transform: isExpanded ? undefined : 'rotate(-90deg)',
                  }}
                />
              </button>
            </h2>
            <div id={panelId} aria-labelledby={headingId} hidden={!isExpanded}>
              <div className="flex flex-col" style={{ gap: LIST_GAP * scale }}>
                {dayStops.map((stop, index) => (
                  <CourseStopItem
                    key={stop.id}
                    stop={{ ...stop, order: index + 1 }}
                    isFirst={index === 0}
                    isLast={index === dayStops.length - 1}
                    onLikeToggle={() => onStopLikeToggle(stop.id)}
                    onFocus={
                      onStopFocus ? () => onStopFocus(stop.id) : undefined
                    }
                    isLikeAvailable={
                      stop.placeId !== undefined || stop.contentId !== undefined
                    }
                    isLikePending={
                      (stop.placeId !== undefined &&
                        pendingPlaceIds.has(stop.placeId)) ||
                      (stop.contentId !== undefined &&
                        pendingContentIds.has(stop.contentId))
                    }
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default CourseStopList;
