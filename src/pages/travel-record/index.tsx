import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import addIcon from '../../assets/icons/material-symbols_add-2-rounded.svg';

import {
  TravelFolderGrid,
  TravelMapPanel,
  TravelYearDropdown,
} from './components';
import { TRAVEL_RECORD_FOLDERS } from './constants/travelRecords';
import type { TravelRecordFolder, TravelRecordView } from './types';
import type { SavedTravelRecordResult } from './utils/travelRecordSave';

interface TravelRecordLocationState {
  savedTravelRecord?: SavedTravelRecordResult;
}

const folderViewLabel = '\uC5EC\uD589 \uD3F4\uB354';
const mapViewLabel = '\uC5EC\uD589 \uC9C0\uB3C4';
const addTravelRecordLabel = '\uC5EC\uD589 \uAE30\uB85D \uCD94\uAC00';

const formatPeriod = (startDate: Date, endDate: Date) => {
  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${month}.${day}`;
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

const formatStartDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const createSavedTravelRecordFolder = (
  savedTravelRecord: SavedTravelRecordResult | undefined
): TravelRecordFolder | null => {
  const selectedRegion = savedTravelRecord?.selectedRegion;
  const selectedDateRange = savedTravelRecord?.selectedDateRange;
  const selectedPhotoUrls = savedTravelRecord?.selectedPhotoUrls ?? [];
  const firstPhotoUrl = selectedPhotoUrls[0];

  if (!selectedRegion || !selectedDateRange || !firstPhotoUrl) {
    return null;
  }

  const secondPhotoUrl = selectedPhotoUrls[1] ?? firstPhotoUrl;
  const title = selectedRegion.selectionName || selectedRegion.name;

  return {
    id: `saved-${selectedRegion.id}-${Date.now()}`,
    regionCode: selectedRegion.id,
    regionName: title,
    title,
    year: selectedDateRange.startDate.getFullYear(),
    startDate: formatStartDate(selectedDateRange.startDate),
    period: formatPeriod(
      selectedDateRange.startDate,
      selectedDateRange.endDate
    ),
    photos: [firstPhotoUrl, secondPhotoUrl, ...selectedPhotoUrls.slice(2)],
  };
};

function TravelRecordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as TravelRecordLocationState | null;
  const generatedPhotoUrlsRef = useRef(
    Array.from(
      new Set(locationState?.savedTravelRecord?.selectedPhotoUrls ?? [])
    )
  );
  const [folders] = useState<TravelRecordFolder[]>(() => {
    const savedFolder = createSavedTravelRecordFolder(
      locationState?.savedTravelRecord
    );

    return savedFolder
      ? [...TRAVEL_RECORD_FOLDERS, savedFolder]
      : TRAVEL_RECORD_FOLDERS;
  });
  const years = useMemo(
    () =>
      Array.from(new Set(folders.map((folder) => folder.year))).sort(
        (currentYear, nextYear) => nextYear - currentYear
      ),
    [folders]
  );
  const [activeView, setActiveView] = useState<TravelRecordView>('folder');
  const handleFolderClick = (folder: TravelRecordFolder) => {
    navigate(`/travel-record/${folder.id}`, { state: { folder } });
  };
  const [selectedYear, setSelectedYear] = useState(years[0]);

  const visibleFolders = useMemo(
    () =>
      folders
        .filter((folder) => folder.year === selectedYear)
        .sort((currentFolder, nextFolder) =>
          nextFolder.startDate.localeCompare(currentFolder.startDate)
        ),
    [folders, selectedYear]
  );

  useEffect(() => {
    if (locationState?.savedTravelRecord) {
      navigate('/travel-record', { replace: true, state: null });
    }
  }, [locationState?.savedTravelRecord, navigate]);

  useEffect(
    () => () => {
      generatedPhotoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    []
  );

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
