import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FloatingActionButton } from '../../components/common';
import { useTravelRecordSessionStore } from '../../store/travelRecordSession.store';
import {
  getTravelRecordFolders,
  getTravelRecordSummariesFromPages,
  useTravelRecordDetails,
  useTravelRecords,
} from '../../hooks/useTravelRecords';

import {
  TravelFolderGrid,
  TravelMapPanel,
  TravelRecordPageFrame,
  TravelYearDropdown,
} from './components';
import { TRAVEL_RECORD_FOLDERS } from './constants/travelRecords';
import type { TravelRecordFolder, TravelRecordView } from './types';
import {
  applyTravelRecordSessionChanges,
  getValidTravelRecordYear,
  getTravelRecordYears,
} from './utils/sessionFolders';

const folderViewLabel = '\uC5EC\uD589 \uD3F4\uB354';
const mapViewLabel = '\uC5EC\uD589 \uC9C0\uB3C4';
const addTravelRecordLabel = '\uC5EC\uD589 \uAE30\uB85D \uCD94\uAC00';

function TravelRecordPage() {
  const navigate = useNavigate();
  const editedMockFolders = useTravelRecordSessionStore(
    (state) => state.editedMockFolders,
  );
  const deletedMockFolderIds = useTravelRecordSessionStore(
    (state) => state.deletedMockFolderIds,
  );
  const travelRecordsQuery = useTravelRecords({ size: 50 });
  const [activeView, setActiveView] = useState<TravelRecordView>('folder');
  const [selectedYear, setSelectedYear] = useState(
    () => TRAVEL_RECORD_FOLDERS[0]?.year ?? new Date().getFullYear(),
  );

  const apiRecordSummaries = useMemo(
    () => getTravelRecordSummariesFromPages(travelRecordsQuery.data?.pages),
    [travelRecordsQuery.data?.pages],
  );
  const travelRecordDetails = useTravelRecordDetails(apiRecordSummaries);
  const apiFolders = useMemo(
    () =>
      getTravelRecordFolders(
        apiRecordSummaries,
        travelRecordDetails.map((query) => query.data),
      ),
    [apiRecordSummaries, travelRecordDetails],
  );

  const displayedFolders = useMemo(
    () => [
      ...applyTravelRecordSessionChanges(
        TRAVEL_RECORD_FOLDERS,
        editedMockFolders,
        new Set(deletedMockFolderIds),
      ),
      ...apiFolders,
    ],
    [apiFolders, deletedMockFolderIds, editedMockFolders],
  );

  const years = useMemo(
    () => getTravelRecordYears(displayedFolders),
    [displayedFolders],
  );
  const validSelectedYear = getValidTravelRecordYear(
    years,
    selectedYear,
    new Date().getFullYear(),
  );
  const visibleFolders = useMemo(
    () =>
      displayedFolders
        .filter((folder) => folder.year === validSelectedYear)
        .sort((currentFolder, nextFolder) =>
          nextFolder.startDate.localeCompare(currentFolder.startDate)
        ),
    [displayedFolders, validSelectedYear]
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
        value={validSelectedYear}
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
        bottomOffset={40}
      />
    </TravelRecordPageFrame>
  );
}

export default TravelRecordPage;
