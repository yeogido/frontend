import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import addIcon from '../../assets/icons/material-symbols_add-2-rounded.svg';

import {
  TravelFolderGrid,
  TravelMapPanel,
  TravelYearDropdown,
} from './components';
import {
  TRAVEL_RECORD_FOLDERS,
  TRAVEL_RECORD_YEARS,
} from './constants/travelRecords';
import type { TravelRecordView } from './types';

function TravelRecordPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<TravelRecordView>('folder');
  const [selectedYear, setSelectedYear] = useState(TRAVEL_RECORD_YEARS[0]);

  const visibleFolders = useMemo(
    () =>
      TRAVEL_RECORD_FOLDERS.filter((folder) => folder.year === selectedYear),
    [selectedYear],
  );

  return (
    <section className="relative mx-auto min-h-screen w-full max-w-[390px] px-6 pt-3 pb-28">
      <div className="flex items-center gap-[30px]" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'folder'}
          onClick={() => setActiveView('folder')}
          className={`text-[20px] leading-none font-semibold whitespace-nowrap ${
            activeView === 'folder' ? 'text-black' : 'text-gray-3'
          }`}
        >
          여행 폴더
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'map'}
          onClick={() => setActiveView('map')}
          className={`text-[20px] leading-none font-semibold whitespace-nowrap ${
            activeView === 'map' ? 'text-black' : 'text-gray-3'
          }`}
        >
          여행 지도
        </button>
      </div>

      <TravelYearDropdown
        value={selectedYear}
        years={TRAVEL_RECORD_YEARS}
        onChange={setSelectedYear}
      />

      {activeView === 'folder' ? (
        <TravelFolderGrid folders={visibleFolders} />
      ) : (
        <TravelMapPanel folders={visibleFolders} />
      )}

      <button
        type="button"
        aria-label="여행 기록 추가"
        onClick={() => navigate('/travel-record/new')}
        className="absolute right-6 bottom-10 z-40 flex size-14 items-center justify-center rounded-full bg-black"
      >
        <img src={addIcon} alt="" className="size-8" />
      </button>
    </section>
  );
}

export default TravelRecordPage;
