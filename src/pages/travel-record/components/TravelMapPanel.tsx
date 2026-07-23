import Map from '../../home/map/components/Map';

import type { MapMarker } from '../../home/map/types/map';
import type { TravelRecordFolder } from '../types';

interface TravelMapPanelProps {
  folders: readonly TravelRecordFolder[];
}

function TravelMapPanel({ folders }: TravelMapPanelProps) {
  const markers = folders.reduce<MapMarker[]>(
    (accumulator, folder) => {
      const marker = accumulator.find(
        ({ regionCode }) => regionCode === folder.regionCode,
      );

      if (marker) {
        marker.count += 1;
        return accumulator;
      }

      accumulator.push({
        regionCode: folder.regionCode,
        regionName: folder.regionName,
        count: 1,
      });

      return accumulator;
    },
    [],
  );

  const totalRecordCount = folders.length;

  return (
    <section
      aria-label="여행 지도"
      className="relative mt-7 h-[596px] overflow-hidden rounded-xl bg-white"
    >
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-[18px] leading-none font-semibold text-black">
          전국 지도
        </h2>
        <p className="mt-2 text-[10px] leading-none font-normal text-gray-3">
          다녀온 지역을 한눈에 확인해 보세요
        </p>
      </div>

      <div className="absolute top-4 right-4 z-10 rounded-full bg-main-2 px-3 py-1 text-[12px] leading-none font-semibold text-main-5">
        {totalRecordCount}개
      </div>

      <div className="absolute inset-0 pt-[55px]">
        <Map
          baseScale={1.62}
          labelBaseScale={2.5}
          minZoom={0.8}
          initialZoom={0.9}
          markers={markers}
        />
      </div>
    </section>
  );
}

export default TravelMapPanel;
