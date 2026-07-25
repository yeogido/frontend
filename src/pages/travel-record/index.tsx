import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import addIcon from '../../assets/icons/material-symbols_add-2-rounded.svg';

import {
  TravelFolderGrid,
  TravelMapPanel,
  TravelYearDropdown,
} from './components';
import { TRAVEL_RECORD_FOLDERS } from './constants/travelRecords';
import type { TravelRecordFolder, TravelRecordView } from './types';
import {
  getSavedTravelRecordFolders,
  revokeTravelRecordFolderPhotoUrls,
} from './utils/travelRecordSave';

const folderViewLabel = '\uC5EC\uD589 \uD3F4\uB354';
const mapViewLabel = '\uC5EC\uD589 \uC9C0\uB3C4';
const addTravelRecordLabel = '\uC5EC\uD589 \uAE30\uB85D \uCD94\uAC00';

interface TravelRecordLocationState {
  savedTravelRecordId?: string;
}

function TravelRecordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as TravelRecordLocationState | null;
  const [folders, setFolders] = useState<TravelRecordFolder[]>(
    TRAVEL_RECORD_FOLDERS,
  );
  const [activeView, setActiveView] = useState<TravelRecordView>('folder');
  const years = useMemo(
    () =>
      Array.from(new Set(folders.map((folder) => folder.year))).sort(
        (currentYear, nextYear) => nextYear - currentYear,
      ),
    [folders],
  );
  const [selectedYear, setSelectedYear] = useState(years[0]);

  useEffect(() => {
    let isMounted = true;
    let savedFolders: TravelRecordFolder[] = [];

    void getSavedTravelRecordFolders()
      .then((folders) => {
        savedFolders = folders;

        if (isMounted) {
          setFolders([...TRAVEL_RECORD_FOLDERS, ...folders]);
          return;
        }

        folders.forEach(revokeTravelRecordFolderPhotoUrls);
      })
      .catch(() => {
        // Keep the mock records available when browser storage is unavailable.
      });

    return () => {
      isMounted = false;
      savedFolders.forEach(revokeTravelRecordFolderPhotoUrls);
    };
  }, [locationState?.savedTravelRecordId]);

  const visibleFolders = useMemo(
    () =>
      folders
        .filter((folder) => folder.year === selectedYear)
        .sort((currentFolder, nextFolder) =>
          nextFolder.startDate.localeCompare(currentFolder.startDate),
        ),
    [folders, selectedYear],
  );
  const handleFolderClick = (folder: TravelRecordFolder) => {
    navigate(`/travel-record/${folder.id}`, { state: { folder } });
  };

  return (
    <section className="relative mx-auto min-h-screen w-full max-w-[390px] px-6 pt-3 pb-28">
      <div className="flex items-center gap-[30px]">
        <button
          type="button"
          aria-current={activeView === 'folder' ? 'page' : undefined}
          onClick={() => setActiveView('folder')}
          className={`text-[20px] leading-none font-semibold whitespace-nowrap ${
            activeView === 'folder' ? 'text-black' : 'text-gray-3'
          }`}
        >
          {folderViewLabel}
        </button>
        <button
          type="button"
          aria-current={activeView === 'map' ? 'page' : undefined}
          onClick={() => setActiveView('map')}
          className={`text-[20px] leading-none font-semibold whitespace-nowrap ${
            activeView === 'map' ? 'text-black' : 'text-gray-3'
          }`}
        >
          {mapViewLabel}
        </button>
      </div>

      <TravelYearDropdown
        value={selectedYear}
        years={years}
        onChange={setSelectedYear}
      />

      {activeView === 'folder' ? (
        <TravelFolderGrid
          folders={visibleFolders}
          onFolderClick={handleFolderClick}
        />
      ) : (
        <TravelMapPanel folders={visibleFolders} />
      )}

      <button
        type="button"
        aria-label={addTravelRecordLabel}
        onClick={() => navigate('/travel-record/new')}
        className="absolute right-6 bottom-10 z-40 flex size-14 items-center justify-center rounded-full bg-black"
      >
        <img src={addIcon} alt="" className="size-8" />
      </button>
    </section>
  );
}

export default TravelRecordPage;
