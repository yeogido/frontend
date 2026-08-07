import Map from '../../home/map/components/Map';
import { toRegionPhotoMap } from '../../home/map/types/regionPhoto';

import type { TravelRecordFolder } from '../types';
import { getTravelRecordRegionPhotoRecords } from '../utils/regionPhotoRecords';

interface TravelMapPanelProps {
  folders: readonly TravelRecordFolder[];
}

const mapPanelLabel = '\uC5EC\uD589 \uC9C0\uB3C4';
const mapTitle = '\uC804\uAD6D \uC9C0\uB3C4';
const mapDescription =
  '\uB2E4\uB140\uC628 \uC9C0\uC5ED\uC744 \uD55C\uB208\uC5D0 \uD655\uC778\uD574 \uBCF4\uC138\uC694';

function TravelMapPanel({ folders }: TravelMapPanelProps) {
  const regionPhotos = toRegionPhotoMap(
    getTravelRecordRegionPhotoRecords(folders),
  );

  return (
    <section
      aria-label={mapPanelLabel}
      className="relative mt-7 h-[596px] overflow-hidden rounded-xl bg-white"
    >
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-[18px] leading-none font-semibold text-black">
          {mapTitle}
        </h2>
        <p className="mt-2 text-[10px] leading-none font-normal text-gray-3">
          {mapDescription}
        </p>
      </div>

      <div className="absolute inset-0 pt-[55px]">
        <Map
          baseScale={1.62}
          labelBaseScale={2.5}
          minZoom={0.8}
          initialZoom={0.9}
          regionPhotos={regionPhotos}
        />
      </div>
    </section>
  );
}

export default TravelMapPanel;
