import { useState } from 'react';
import type { TravelMapViewer, TravelRecordFolder } from '../types';
import {
  filterTravelMapFoldersByYear,
  getTravelMapYears,
} from '../utils/mapYears';
import TravelMapPanel from './TravelMapPanel';
import TravelYearDropdown from './TravelYearDropdown';

interface TravelMapViewProps {
  folders: readonly TravelRecordFolder[];
  viewer?: TravelMapViewer;
  ownerName?: string;
}

/** 내 지도와 공유받은 지도에 동일한 연도 선택 및 공개범위 규칙을 적용한다. */
function TravelMapView({
  folders,
  viewer = 'owner',
  ownerName,
}: TravelMapViewProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const years = getTravelMapYears(
    folders.map((folder) => Number(folder.startDate.slice(0, 4))),
    new Date().getFullYear()
  );

  return (
    <>
      <div className="mt-4">
        <TravelYearDropdown
          value={selectedYear}
          years={years}
          onChange={setSelectedYear}
          onSelectAll={() => setSelectedYear(null)}
        />
      </div>
      <TravelMapPanel
        folders={filterTravelMapFoldersByYear(folders, selectedYear)}
        viewer={viewer}
        ownerName={ownerName}
      />
    </>
  );
}

export default TravelMapView;
