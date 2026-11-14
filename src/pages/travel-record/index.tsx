import { getApiErrorMessage } from '../../apis/common';
import { FloatingActionButton, LoadingSpinner } from '../../components/common';
import {
  TravelFolderGrid,
  TravelFolderGridSkeleton,
  TravelRecordPageFrame,
  TravelYearDropdown,
  TravelYearDropdownSkeleton,
} from './components';
import TravelRecordVisibilityFilters from './components/TravelRecordVisibilityFilters';
import TravelMapView from './components/TravelMapView';
import { useTravelRecordPage } from './useTravelRecordPage';

const folderViewLabel = '여행 폴더';
const mapViewLabel = '여행 지도';
const addTravelRecordLabel = '여행 기록 추가';

function TravelRecordPage() {
  const {
    navigate,
    clearEdit,
    visibilityFilter,
    setVisibilityFilter,
    activeView,
    setActiveView,
    previewSharedFolders,
    recentlySavedFolderId,
    setSelectedYear,
    years,
    validSelectedYear,
    isPending,
    hasPreviewContent,
    visibleInvitations,
    visibleFolders,
    handleAcceptInvitation,
    handleDeclineInvitation,
    pendingIds,
    invitationsPending,
    invitationsError,
    invitationsQuery,
    isTravelRecordsError,
    travelRecordsError,
    isMapError,
    isMapPending,
    mapRecordsQuery,
    refetchTravelRecords,
    handleFolderClick,
    loadMoreRef,
  } = useTravelRecordPage();

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

      {/* 기록이 하나도 없으면 고를 연도가 없어 빈 목록만 열린다. 연도가 아직
          안 왔더라도 조회 중이면 자리를 잡아 둬야 목록이 밀리지 않는다. */}
      {activeView === 'folder' && (
        <div className="mt-4 flex items-center gap-2">
          {years.length > 0 ? (
            <TravelYearDropdown
              value={validSelectedYear}
              years={years}
              onChange={setSelectedYear}
            />
          ) : isPending ? (
            <TravelYearDropdownSkeleton />
          ) : null}
          {activeView === 'folder' && (
            <TravelRecordVisibilityFilters
              value={visibilityFilter}
              onChange={setVisibilityFilter}
            />
          )}
        </div>
      )}

      {activeView === 'folder' &&
        (!isPending || hasPreviewContent || visibleInvitations.length > 0) && (
          <TravelFolderGrid
            folders={visibleFolders}
            invitations={visibleInvitations}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={handleDeclineInvitation}
            pendingInvitationIds={pendingIds}
            hideEmptyState={
              invitationsPending || invitationsError || isTravelRecordsError
            }
            onFolderClick={handleFolderClick}
            recentlySavedFolderId={recentlySavedFolderId}
            isFiltered={visibilityFilter !== 'all'}
          />
        )}

      {activeView === 'folder' && invitationsError && (
        <section
          role="alert"
          className="mt-4 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-gray-4 text-sm">
            {getApiErrorMessage(
              invitationsQuery.error,
              '받은 초대를 불러오지 못했어요.'
            )}
          </p>
          <button
            type="button"
            className="rounded-full border border-[#e4e4e4] px-4 py-2 text-sm text-[#505050]"
            onClick={() => void invitationsQuery.retry()}
          >
            받은 초대 다시 시도
          </button>
        </section>
      )}

      {(activeView === 'map' ? isMapError : isTravelRecordsError) ? (
        <section
          role="alert"
          className="mt-[142px] flex flex-col items-center gap-4 text-center"
        >
          <p className="text-gray-4 text-[16px] leading-[22px] font-medium">
            {getApiErrorMessage(
              activeView === 'map' ? undefined : travelRecordsError,
              '여행 기록을 불러오지 못했어요'
            )}
          </p>
          <button
            type="button"
            onClick={() =>
              activeView === 'map'
                ? mapRecordsQuery.retry()
                : void refetchTravelRecords()
            }
            className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[14px] font-medium text-[#505050]"
          >
            다시 시도
          </button>
        </section>
      ) : activeView === 'folder' ? (
        // 첫 조회가 끝나기 전에는 목록이 비어 있어 '기록이 없어요' 안내가
        // 잠깐 스쳐 지나간다. 그동안은 폴더 자리 표시를 대신 보여 준다.
        isPending || invitationsPending ? (
          <TravelFolderGridSkeleton />
        ) : null
      ) : isMapPending ? (
        <section
          aria-label="여행 지도 불러오는 중"
          aria-busy="true"
          className="mt-4 flex h-[596px] flex-col items-center justify-center gap-3 rounded-xl bg-white"
        >
          <LoadingSpinner label="전체 연도 여행 기록을 불러오는 중" />
          <p className="text-gray-4 text-sm">
            전체 연도 기록을 불러오고 있어요
          </p>
        </section>
      ) : (
        <TravelMapView
          folders={[...previewSharedFolders, ...mapRecordsQuery.folders]}
        />
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
