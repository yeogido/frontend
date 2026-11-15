import { useId, useState } from 'react';

import dayChevronIcon from '../../../assets/icons/course-day-chevron.svg';
import {
  getCourseDayLabel,
  groupCourseStopsByDay,
} from '../../../utils/courseDetail';
import type { CourseStop } from '../types/courseDetail';
import CourseStopDesktopItem from './CourseStopDesktopItem';

export interface CourseStopDesktopListProps {
  readonly stops: readonly CourseStop[];
  readonly onStopLikeToggle: (stopId: number) => void;
  readonly onStopFocus?: (stopId: number) => void;
  readonly pendingPlaceIds?: ReadonlySet<number>;
  readonly pendingContentIds?: ReadonlySet<number>;
}

/** 일차별 일정 목록. 일차 제목을 눌러 접고 펼 수 있다(모바일과 같다). */
function CourseStopDesktopList({
  stops,
  onStopLikeToggle,
  onStopFocus,
  pendingPlaceIds = new Set<number>(),
  pendingContentIds = new Set<number>(),
}: CourseStopDesktopListProps) {
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
    <div className="flex flex-col gap-[60px]">
      {days.map(({ day, stops: dayStops }) => {
        const isExpanded = !collapsedDays.has(day);
        const panelId = listId + '-day-' + day;
        const headingId = panelId + '-heading';

        return (
          <section key={day} className="flex flex-col gap-[24px]">
            <h2>
              <button
                id={headingId}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggleDay(day)}
                className="flex cursor-pointer items-center gap-[8px] text-[24px] font-semibold text-black"
              >
                {getCourseDayLabel(day)}
                <img
                  src={dayChevronIcon}
                  alt=""
                  aria-hidden="true"
                  className="size-[24px] shrink-0 transition-transform motion-reduce:transition-none"
                  style={{
                    transform: isExpanded ? undefined : 'rotate(-90deg)',
                  }}
                />
              </button>
            </h2>

            <div id={panelId} aria-labelledby={headingId} hidden={!isExpanded}>
              <div className="flex flex-col gap-[32px]">
                {dayStops.map((stop, index) => (
                  <CourseStopDesktopItem
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

export default CourseStopDesktopList;
