import { getApiErrorMessage } from '../../../apis/common';
import { LoadingSpinner } from '../../../components/common';
import DesktopPageShell from '../../../components/layout/desktop/DesktopPageShell';
import addIcon from '../../../assets/icons/material-symbols_add-2-rounded.svg';
import {
  TravelFolderGrid,
  TravelFolderGridSkeleton,
  TravelYearDropdown,
  TravelYearDropdownSkeleton,
} from '../components';
import TravelRecordVisibilityFilters from '../components/TravelRecordVisibilityFilters';
import TravelMapView from '../components/TravelMapView';
import { useTravelRecordPage } from '../useTravelRecordPage';

/** Figma 6313:56769 / 6323:58110 — 여행 폴더와 여행 지도. */
function TravelRecordDesktopPage() {
  const {
    navigate,
    clearEdit,
    activeView,
    setActiveView,
    years,
    validSelectedYear,
    setSelectedYear,
    isPending,
    visibilityFilter,
    setVisibilityFilter,
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
    recentlySavedFolderId,
    previewSharedFolders,
    loadMoreRef,
  } = useTravelRecordPage();
  const addButton = (
    <button
      type="button"
      onClick={() => {
        clearEdit();
        navigate('/travel-record/new');
      }}
      className="bg-main-5 flex shrink-0 items-center gap-[6px] rounded-[12px] px-[14px] py-[8px] text-[18px] font-semibold text-white"
    >
      <img src={addIcon} alt="" width="20" height="20" />
      기록 추가하기
    </button>
  );
  const mainError = activeView === 'map' ? isMapError : isTravelRecordsError;

  return (
    <DesktopPageShell contentWidth={744}>
      <div className="flex items-center gap-[36px]">
        <button
          type="button"
          aria-current={activeView === 'folder' ? 'page' : undefined}
          onClick={() => setActiveView('folder')}
          className={`text-[32px] font-semibold ${activeView === 'folder' ? 'text-black' : 'text-gray-3'}`}
        >
          여행 폴더
        </button>
        <button
          type="button"
          aria-current={activeView === 'map' ? 'page' : undefined}
          onClick={() => setActiveView('map')}
          className={`text-[32px] font-semibold ${activeView === 'map' ? 'text-black' : 'text-gray-3'}`}
        >
          여행 지도
        </button>
      </div>
      {activeView === 'folder' ? (
        <>
          <div className="mt-[40px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-[16px]">
              {years.length > 0 ? (
                <TravelYearDropdown
                  value={validSelectedYear}
                  years={years}
                  onChange={setSelectedYear}
                  desktop
                />
              ) : isPending ? (
                <TravelYearDropdownSkeleton />
              ) : null}
              <TravelRecordVisibilityFilters
                value={visibilityFilter}
                onChange={setVisibilityFilter}
                desktop
              />
            </div>
            {addButton}
          </div>
          {(!isPending ||
            hasPreviewContent ||
            visibleInvitations.length > 0) && (
            <TravelFolderGrid
              desktop
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
          {invitationsError && (
            <section
              role="alert"
              className="mt-4 flex flex-col items-center gap-4 text-center"
            >
              <p>
                {getApiErrorMessage(
                  invitationsQuery.error,
                  '받은 초대를 불러오지 못했어요.'
                )}
              </p>
              <button
                type="button"
                className="rounded-full border px-4 py-2"
                onClick={() => void invitationsQuery.retry()}
              >
                받은 초대 다시 시도
              </button>
            </section>
          )}
        </>
      ) : null}
      {activeView === 'map' && (isMapError || isMapPending) ? (
        <div className="mt-[40px] flex justify-end">{addButton}</div>
      ) : null}
      {mainError ? (
        <section
          role="alert"
          className="text-gray-4 mt-[100px] flex flex-col items-center gap-4 text-center"
        >
          <p>
            {getApiErrorMessage(
              activeView === 'map' ? undefined : travelRecordsError,
              '여행 기록을 불러오지 못했어요'
            )}
          </p>
          <button
            type="button"
            className="rounded-full border px-4 py-2"
            onClick={() =>
              activeView === 'map'
                ? mapRecordsQuery.retry()
                : void refetchTravelRecords()
            }
          >
            다시 시도
          </button>
        </section>
      ) : activeView === 'folder' ? (
        isPending || invitationsPending ? (
          <TravelFolderGridSkeleton />
        ) : null
      ) : isMapPending ? (
        <section
          aria-label="여행 지도 불러오는 중"
          aria-busy="true"
          className="mt-[40px] flex h-[666px] flex-col items-center justify-center gap-3 rounded-xl"
        >
          <LoadingSpinner label="전체 연도 여행 기록을 불러오는 중" />
        </section>
      ) : (
        <TravelMapView
          desktop
          action={addButton}
          folders={[...previewSharedFolders, ...mapRecordsQuery.folders]}
        />
      )}
      <div ref={loadMoreRef} aria-hidden="true" />
    </DesktopPageShell>
  );
}

export default TravelRecordDesktopPage;
