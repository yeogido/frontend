import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FloatingActionButton } from '../../components/common';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { useTravelRecordRegionDetails } from '../../hooks/useTravelRecordRegions';
import { useTravelRecordSessionStore } from '../../store/travelRecordSession.store';
import {
  getTravelRecordFolders,
  getTravelRecordSummariesFromPages,
  useTravelRecordDetails,
  useTravelRecordYears,
  useTravelRecords,
} from '../../hooks/useTravelRecords';

import {
  TravelFolderGrid,
  TravelMapPanel,
  TravelRecordPageFrame,
  TravelYearDropdown,
} from './components';
import type { TravelRecordFolder, TravelRecordView } from './types';
import { getValidTravelRecordYear } from './utils/sessionFolders';

const folderViewLabel = '\uC5EC\uD589 \uD3F4\uB354';
const mapViewLabel = '\uC5EC\uD589 \uC9C0\uB3C4';
const addTravelRecordLabel = '\uC5EC\uD589 \uAE30\uB85D \uCD94\uAC00';
const TRAVEL_RECORD_PAGE_SIZE = 20;

function TravelRecordPage() {
  const navigate = useNavigate();
  const clearEdit = useTravelRecordSessionStore((state) => state.clearEdit);
  const [activeView, setActiveView] = useState<TravelRecordView>('folder');
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const travelRecordYearsQuery = useTravelRecordYears();
  const years = useMemo(
    () => travelRecordYearsQuery.data?.years ?? [],
    [travelRecordYearsQuery.data?.years],
  );

  useEffect(() => {
    // The available years only settle once the server years finish loading.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedYear((year) =>
      getValidTravelRecordYear(years, year, new Date().getFullYear()),
    );
  }, [years]);

  const validSelectedYear = getValidTravelRecordYear(
    years,
    selectedYear,
    new Date().getFullYear(),
  );

  const travelRecordsQuery = useTravelRecords({
    size: TRAVEL_RECORD_PAGE_SIZE,
    year: validSelectedYear,
  });

  const apiRecordSummaries = useMemo(
    () => getTravelRecordSummariesFromPages(travelRecordsQuery.data?.pages),
    [travelRecordsQuery.data?.pages],
  );
  const travelRecordDetails = useTravelRecordDetails(apiRecordSummaries);
  const regionInfoByRegionId = useTravelRecordRegionDetails(
    apiRecordSummaries.map((record) => record.regionId),
  );
  const apiFolders = useMemo(
    () =>
      getTravelRecordFolders(
        apiRecordSummaries,
        travelRecordDetails.map((query) => query.data),
        regionInfoByRegionId,
      ),
    [apiRecordSummaries, travelRecordDetails, regionInfoByRegionId],
  );

  const visibleFolders = useMemo(
    () =>
      [...apiFolders].sort((currentFolder, nextFolder) =>
        nextFolder.startDate.localeCompare(currentFolder.startDate),
      ),
    [apiFolders],
  );

  const handleLoadMore = useCallback(() => {
    if (travelRecordsQuery.hasNextPage && !travelRecordsQuery.isFetchingNextPage) {
      void travelRecordsQuery.fetchNextPage();
    }
  }, [travelRecordsQuery]);

  const loadMoreRef = useInfiniteScroll({
    enabled:
      Boolean(travelRecordsQuery.hasNextPage) &&
      !travelRecordsQuery.isPending,
    onIntersect: handleLoadMore,
  });

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

      <div ref={loadMoreRef} aria-hidden="true" />

      <FloatingActionButton
        ariaLabel={addTravelRecordLabel}
        onClick={() => {
          clearEdit();
          navigate('/travel-record/new');
        }}
        bottomOffset={40}
      />
    </TravelRecordPageFrame>
  );
}

export default TravelRecordPage;
