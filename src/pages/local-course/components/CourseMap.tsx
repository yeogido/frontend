import type { CourseStop } from '../types/course';

import CourseStopItem from './CourseStopItem';

interface CourseMapProps {
  stops: CourseStop[];
}

function CourseMap({ stops }: CourseMapProps) {
  return (
    <section className="rounded-xl p-5">
      <h2 className="mb-3 text-[16px] leading-none font-bold text-[var(--color-text)]">
        코스 지도
      </h2>

      <div className="relative h-[240px] overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-green)] sm:h-[300px]">
        <span className="absolute bottom-4 left-4 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1 text-[12px] font-semibold text-[var(--color-text-muted)]">
          Kakao Map 예정
        </span>
      </div>

      <div className="mt-4 divide-y divide-[var(--color-line)]">
        {stops.map((stop, index) => (
          <CourseStopItem
            key={stop.id}
            stop={stop}
            isLast={index === stops.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

export default CourseMap;
