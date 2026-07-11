import type { CourseStop } from '../types/course';

import CourseStopItem from './CourseStopItem';
import { LocationIcon } from './icons';

interface CourseMapProps {
  stops: CourseStop[];
}

function CourseMap({ stops }: CourseMapProps) {
  return (
    <section className="px-5 sm:px-6 lg:px-8">
      <h2 className="mb-3 text-[16px] leading-none font-bold text-black lg:text-[20px]">
        코스 지도
      </h2>

      <div className="lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:gap-6">
        <div className="relative aspect-square max-h-[380px] min-h-[280px] overflow-hidden rounded-xl bg-[#BFEFD5] lg:aspect-[4/3] lg:max-h-none lg:min-h-[420px]">
          <div className="absolute inset-y-0 right-0 w-[34%] bg-[#82D4DF]" />
          <div className="absolute top-[-8%] left-[42%] h-[120%] w-[13%] rotate-[-28deg] bg-[#EAF0F4]" />
          <div className="absolute top-[-8%] left-[49%] h-[120%] w-[4%] rotate-[-28deg] bg-[#AEB8C2]" />
          <div className="absolute top-[35%] left-[7%] h-[58%] w-[12%] rotate-[-10deg] rounded-full bg-[#DDE8ED]" />
          <div className="absolute top-[52%] left-[36%] h-[50%] w-[10%] rotate-[-42deg] rounded-full bg-[#DDE8ED]" />
          <div className="absolute top-[22%] left-[8%] h-[40%] w-[54%] rotate-[18deg] rounded-[40px] border-[3px] border-dashed border-main-5 min-[360px]:border-4" />

          <span className="absolute top-[30%] left-[29%] flex h-7 w-7 items-center justify-center rounded-full bg-main-5 text-white shadow-sm lg:h-9 lg:w-9">
            <LocationIcon className="h-4 w-4 lg:h-5 lg:w-5" />
          </span>
          <span className="absolute top-[58%] left-[8%] flex h-7 w-7 items-center justify-center rounded-full bg-main-5 text-white shadow-sm lg:h-9 lg:w-9">
            <LocationIcon className="h-4 w-4 lg:h-5 lg:w-5" />
          </span>
          <span className="absolute top-[31%] right-[13%] flex h-7 w-7 items-center justify-center rounded-full bg-main-5 text-white shadow-sm lg:h-9 lg:w-9">
            <LocationIcon className="h-4 w-4 lg:h-5 lg:w-5" />
          </span>

          <span className="absolute top-[31%] left-[8%] max-w-[72px] text-[9px] leading-3 font-bold break-keep text-main-5 lg:max-w-[120px] lg:text-[12px] lg:leading-4">
            강문떡갈비
          </span>
          <span className="absolute top-[44%] left-[26%] text-[9px] leading-3 font-bold text-main-5 lg:text-[12px]">
            ODD
          </span>
          <span className="absolute right-[8%] bottom-[8%] rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold whitespace-nowrap text-gray-5 lg:text-[12px]">
            지도 API 연결 예정
          </span>
        </div>

        <div className="mt-4 lg:mt-0 lg:rounded-xl lg:bg-background lg:p-4">
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
