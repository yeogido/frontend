import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { FloatingActionButton } from '../../components/common';
import { useTravelRecordSessionStore } from '../../store/travelRecordSession.store';

import {
  TravelFolderGrid,
  TravelMapPanel,
  TravelRecordPageFrame,
  TravelYearDropdown,
} from './components';
import { TRAVEL_RECORD_FOLDERS } from './constants/travelRecords';
import type { TravelRecordFolder, TravelRecordView } from './types';
import {
  getSavedTravelRecordFolders,
  revokeTravelRecordFolderPhotoUrls,
} from './utils/travelRecordSave';
import { applyTravelRecordSessionChanges } from './utils/sessionFolders';

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
  const editedMockFolders = useTravelRecordSessionStore(
    (state) => state.editedMockFolders,
  );
  const deletedMockFolderIds = useTravelRecordSessionStore(
    (state) => state.deletedMockFolderIds,
  );
  const [folders, setFolders] = useState<TravelRecordFolder[]>(
    TRAVEL_RECORD_FOLDERS
  );
  const [activeView, setActiveView] = useState<TravelRecordView>('folder');
  const years = useMemo(
    () =>
      Array.from(new Set(folders.map((folder) => folder.year))).sort(
        (currentYear, nextYear) => nextYear - currentYear
      ),
    [folders]
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

          const savedFolder = folders.find(
            (folder) => folder.id === locationState?.savedTravelRecordId
          );
          const latestSavedFolder = [...folders].sort(
            (currentFolder, nextFolder) =>
              nextFolder.startDate.localeCompare(currentFolder.startDate)
          )[0];
          const defaultSelectedYear = (savedFolder ?? latestSavedFolder)?.year;

          if (defaultSelectedYear) {
            setSelectedYear(defaultSelectedYear);
          }

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

  const displayedFolders = useMemo(
    () => [
      ...applyTravelRecordSessionChanges(
        TRAVEL_RECORD_FOLDERS,
        editedMockFolders,
        new Set(deletedMockFolderIds),
      ),
      ...folders.filter((folder) => folder.id.startsWith('saved-')),
    ],
    [deletedMockFolderIds, editedMockFolders, folders],
  );
  const visibleFolders = useMemo(
    () =>
      displayedFolders
        .filter((folder) => folder.year === selectedYear)
        .sort((currentFolder, nextFolder) =>
          nextFolder.startDate.localeCompare(currentFolder.startDate)
        ),
    [displayedFolders, selectedYear]
  );
  const handleFolderClick = (folder: TravelRecordFolder) => {
    navigate(`/travel-record/${folder.id}`, { state: { folder } });
  };

  return (
    <TravelRecordPageFrame scrollable className="bg-[#f1f1f1] px-6 pt-3 pb-28">
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

      <FloatingActionButton
        ariaLabel={addTravelRecordLabel}
        onClick={() => navigate('/travel-record/new')}
      />
    </TravelRecordPageFrame>
  );
}

export default TravelRecordPage;
