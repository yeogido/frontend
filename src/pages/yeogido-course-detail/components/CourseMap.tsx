import type { CourseStop } from '../types/course';

import CourseStopItem from './CourseStopItem';

interface CourseMapProps {
  stops: CourseStop[];
}

function CourseMap({ stops }: CourseMapProps) {
  return (
    <section className="px-5">
      <h2 className="mb-3 text-[16px] leading-none font-bold text-black">
        코스 지도
      </h2>
      <div className="flex flex-col gap-3">
        <div className="mt-4">
          {stops.map((stop, index) => (
            <CourseStopItem
              key={stop.id}
              stop={stop}
              isLast={index === stops.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CourseMap;
