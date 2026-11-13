import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTravelRecordInvitations } from '../../hooks/useTravelRecordInvitations';
import { useRespondToTravelRecordInvitation } from '../../hooks/useRespondToTravelRecordInvitation';
import { useTravelMap } from '../../hooks/useTravelMap';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { useTravelRecordRegionDetailsState } from '../../hooks/useTravelRecordRegions';
import { useTravelRecordSessionStore } from '../../store/travelRecordSession.store';
import {
  getTravelRecordFolders,
  getTravelRecordSummariesFromPages,
  useTravelRecordDetails,
  useTravelRecordYears,
  useTravelRecords,
} from '../../hooks/useTravelRecords';
import type { TravelRecordFolder, TravelRecordVisibilityFilter } from './types';
import { getValidTravelRecordYear } from './utils/sessionFolders';
import { getSavedTravelRecordState } from './utils/savedTravelRecord';

const TRAVEL_RECORD_PAGE_SIZE = 20;

export function useTravelRecordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [visibilityFilter, setVisibilityFilter] =
    useState<TravelRecordVisibilityFilter>('all');
  const previewSharedFolders = useTravelRecordSessionStore(
    (state) => state.previewSharedFolders
  );
  const clearEdit = useTravelRecordSessionStore((state) => state.clearEdit);
  // 상세·작성 화면에 다녀오면 이 페이지가 다시 마운트되므로, 보고 있던 탭은
  // 컴포넌트 상태가 아니라 세션에 남겨 둔다.
  const activeView = useTravelRecordSessionStore((state) => state.listView);
  const setActiveView = useTravelRecordSessionStore(
    (state) => state.setListView
  );
  const [savedTravelRecord] = useState(() =>
    getSavedTravelRecordState(location.state)
  );
  const [selectedYear, setSelectedYear] = useState(
    () => savedTravelRecord?.year ?? new Date().getFullYear()
  );
  const recentlySavedFolderId = savedTravelRecord?.id ?? null;

  useEffect(() => {
    if (!getSavedTravelRecordState(location.state)) return;

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const invitationsQuery = useTravelRecordInvitations({
    enabled: activeView === 'folder',
  });
  const { respond, pendingIds } = useRespondToTravelRecordInvitation();
  const showInvitations =
    visibilityFilter === 'all' || visibilityFilter === 'friends';
  const invitations = invitationsQuery.invitations;
  const handleAcceptInvitation = (invitation: { id: string }) =>
    respond(invitation.id, 'ACCEPTED');
  const handleDeclineInvitation = (id: string) => respond(id, 'DECLINED');

  const travelRecordYearsQuery = useTravelRecordYears();
  const years = useMemo(
    () =>
      [
        ...new Set([
          ...(travelRecordYearsQuery.data?.years ?? []),
          ...previewSharedFolders.map((folder) =>
            Number(folder.startDate.slice(0, 4))
          ),
        ]),
      ].sort((a, b) => b - a),
    [travelRecordYearsQuery.data?.years, previewSharedFolders]
  );

  useEffect(() => {
    // The available years only settle once the server years finish loading.
    if (!travelRecordYearsQuery.isPending && years.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedYear((year) =>
        getValidTravelRecordYear(years, year, new Date().getFullYear())
      );
    }
  }, [travelRecordYearsQuery.isPending, years]);

  const validSelectedYear =
    !travelRecordYearsQuery.isPending && years.length > 0
      ? getValidTravelRecordYear(years, selectedYear, new Date().getFullYear())
      : selectedYear;

  const {
    data: travelRecordsData,
    error: travelRecordsError,
    fetchNextPage,
    hasNextPage,
    isError: isTravelRecordsError,
    isFetchingNextPage,
    isPending,
    refetch: refetchTravelRecords,
  } = useTravelRecords(
    { size: TRAVEL_RECORD_PAGE_SIZE, year: validSelectedYear },
    { enabled: activeView === 'folder' }
  );

  const apiRecordSummaries = useMemo(
    () =>
      activeView === 'folder'
        ? getTravelRecordSummariesFromPages(travelRecordsData?.pages)
        : [],
    [activeView, travelRecordsData?.pages]
  );
  const mapRecordsQuery = useTravelMap({
    enabled: activeView === 'map',
  });
  const travelRecordDetails = useTravelRecordDetails(apiRecordSummaries);
  const regionDetailsQuery = useTravelRecordRegionDetailsState(
    apiRecordSummaries.map((record) => record.regionId)
  );
  const regionInfoByRegionId = regionDetailsQuery.data;
  const isMapPending = mapRecordsQuery.isPending;
  const isMapError = mapRecordsQuery.isError;
  const apiFolders = useMemo(
    () =>
      getTravelRecordFolders(
        apiRecordSummaries,
        travelRecordDetails.map((query) => query.data),
        regionInfoByRegionId
      ),
    [apiRecordSummaries, travelRecordDetails, regionInfoByRegionId]
  );

  // 서버가 travelRecordId 내림차순으로 잘라 주므로 그 순서를 그대로 쓴다.
  // 받은 페이지만 다시 정렬하면 다음 페이지를 불러올 때 뒤에 붙은 기록이
  // 위로 끼어들어 목록이 튄다.
  // 공개범위가 제공되지 않는 기존 API 데이터는 '전체'에만 표시한다.
  const visibleFolders = [...previewSharedFolders, ...apiFolders].filter(
    (folder) =>
      Number(folder.startDate.slice(0, 4)) === validSelectedYear &&
      (visibilityFilter === 'all' || folder.visibility === visibilityFilter)
  );
  const visibleInvitations = showInvitations ? invitations : [];
  const hasPreviewContent = visibleFolders.some((folder) =>
    folder.id.startsWith('preview-')
  );
  const canLoadFolders =
    Boolean(hasNextPage) && !isFetchingNextPage && !isTravelRecordsError;
  const canLoadInvitations =
    showInvitations &&
    Boolean(invitationsQuery.hasNextPage) &&
    !invitationsQuery.isFetchingNextPage &&
    !invitationsQuery.isError;
  const fetchNextInvitations = invitationsQuery.fetchNextPage;
  const handleLoadMore = useCallback(() => {
    if (canLoadFolders) void fetchNextPage();
    if (canLoadInvitations) void fetchNextInvitations();
  }, [canLoadFolders, canLoadInvitations, fetchNextPage, fetchNextInvitations]);
  const loadMoreRef = useInfiniteScroll({
    enabled: activeView === 'folder' && (canLoadFolders || canLoadInvitations),
    onIntersect: handleLoadMore,
  });
  const invitationsPending = showInvitations && invitationsQuery.isLoading;
  const invitationsError = showInvitations && invitationsQuery.isError;

  const handleFolderClick = (folder: TravelRecordFolder) => {
    navigate(`/travel-record/${folder.id}`, { state: { folder } });
  };

  return {
    navigate,
    clearEdit,
    visibilityFilter,
    setVisibilityFilter,
    activeView,
    setActiveView,
    previewSharedFolders,
    savedTravelRecord,
    recentlySavedFolderId,
    selectedYear,
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
  };
}
