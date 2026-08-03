import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../../apis/common';
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

  const {
    data: travelRecordsData,
    error: travelRecordsError,
    fetchNextPage,
    hasNextPage,
    isError: isTravelRecordsError,
    isFetchingNextPage,
    isPending,
    refetch: refetchTravelRecords,
  } = useTravelRecords({
    size: TRAVEL_RECORD_PAGE_SIZE,
    year: validSelectedYear,
  });

  const apiRecordSummaries = useMemo(
    () => getTravelRecordSummariesFromPages(travelRecordsData?.pages),
    [travelRecordsData?.pages],
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

  // 서버가 travelRecordId 내림차순으로 잘라 주므로 그 순서를 그대로 쓴다.
  // 받은 페이지만 다시 정렬하면 다음 페이지를 불러올 때 뒤에 붙은 기록이
  // 위로 끼어들어 목록이 튄다.
  const visibleFolders = apiFolders;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
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

      {isTravelRecordsError ? (
        <section
          role="alert"
          className="mt-[142px] flex flex-col items-center gap-4 text-center"
        >
          <p className="text-gray-4 text-[16px] leading-[22px] font-medium">
            {getApiErrorMessage(
              travelRecordsError,
              '여행 기록을 불러오지 못했어요',
            )}
          </p>
          <button
            type="button"
            onClick={() => void refetchTravelRecords()}
            className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[14px] font-medium text-[#505050]"
          >
            다시 시도
          </button>
        </section>
      ) : activeView === 'folder' ? (
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
