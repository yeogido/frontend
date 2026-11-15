import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getApiErrorMessage } from '../../../../apis/common';
import { LoadingSpinner } from '../../../../components/common';
import {
  useFriendTravelRecords,
  useFriendTravelRecordYears,
} from '../../../../hooks/useFriendTravelRecords';
import useInfiniteScroll from '../../../../hooks/useInfiniteScroll';
import { canFetchNextRequestPage } from '../../../../hooks/utils/friendRequestPages';
import {
  resolveFriendRecordYear,
  toFriendTravelFolder,
} from '../../../../hooks/utils/friendTravelRecordPages';
import { buildRecordPath } from '../../../home/map/constants/cityMeta';
import {
  TravelFolderGrid,
  TravelFolderGridSkeleton,
  TravelYearDropdown,
  TravelYearDropdownSkeleton,
} from '../../../travel-record/components';
import type { TravelRecordFolder } from '../../../travel-record/types';
import FriendListMessage from '../../components/FriendListMessage';
import {
  canLoadMoreAutomatically,
  shouldShowLoadMoreError,
} from '../../utils/friendListStatus';
import {
  FRIEND_PROFILE_YEAR_PARAM,
  parseFriendProfileYear,
  withFriendProfileYear,
} from '../friendProfileTabs';
import FriendProfileMessage from './FriendProfileMessage';

const EMPTY_MESSAGE = '아직 공개된 여행 폴더가 없어요';
const LOAD_ERROR_MESSAGE = '여행 폴더를 불러오지 못했어요.';
const LOAD_MORE_ERROR_MESSAGE = '여행 폴더를 더 불러오지 못했어요.';

interface FriendFolderTabProps {
  friendUserId: number;
  scale: number;
}

/**
 * 친구의 여행 폴더. 서버가 이 사용자에게 보여 줄 폴더만 내려 주므로 공개범위를
 * 다시 거르지 않는다. 카드를 누르면 상세로 가되 목록 데이터는 넘기지 않아 상세가
 * 직접 조회한다(목록에는 권한과 버전이 없다).
 */
function FriendFolderTab({ friendUserId, scale }: FriendFolderTabProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const yearsQuery = useFriendTravelRecordYears(friendUserId);
  // URL 연도가 목록에 없으면 올해, 그것도 없으면 최신 연도로 본다. URL은 고쳐 쓰지
  // 않고, 사용자가 고르면 그때 ?year=를 명시적으로 쓴다.
  const year = resolveFriendRecordYear(
    yearsQuery.years,
    parseFriendProfileYear(searchParams.get(FRIEND_PROFILE_YEAR_PARAM)),
    new Date().getFullYear()
  );
  const handleYearChange = (nextYear: number) =>
    setSearchParams((previous) => withFriendProfileYear(previous, nextYear), {
      replace: true,
    });

  const {
    records,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useFriendTravelRecords(friendUserId, year);
  const folders = useMemo(() => records.map(toFriendTravelFolder), [records]);

  const handleFolderClick = (folder: TravelRecordFolder) =>
    navigate(buildRecordPath(folder.id));

  const handleLoadMore = useCallback(() => {
    if (
      canFetchNextRequestPage({ hasNextPage, isFetching, isFetchingNextPage })
    ) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: canLoadMoreAutomatically({ hasNextPage, isPending, isError }),
    onIntersect: handleLoadMore,
  });

  const showLoadMoreError = shouldShowLoadMoreError({
    isFetchNextPageError,
    isFetchingNextPage,
    friendCount: folders.length,
  });

  let dropdown = null;
  let content;

  if (yearsQuery.isPending) {
    dropdown = <TravelYearDropdownSkeleton />;
    content = <TravelFolderGridSkeleton />;
  } else if (yearsQuery.isError) {
    content = (
      <FriendListMessage
        variant="error"
        scale={scale}
        errorMessage={getApiErrorMessage(yearsQuery.error, LOAD_ERROR_MESSAGE)}
        onRetry={() => void yearsQuery.refetch()}
      />
    );
  } else if (year === null) {
    content = <FriendProfileMessage message={EMPTY_MESSAGE} scale={scale} />;
  } else {
    // 전체가 없어서 onSelectAll을 주지 않는다.
    dropdown = (
      <TravelYearDropdown
        value={year}
        years={yearsQuery.years}
        onChange={handleYearChange}
      />
    );

    if (isPending) {
      content = <TravelFolderGridSkeleton />;
    } else if (isError && folders.length === 0) {
      content = (
        <FriendListMessage
          variant="error"
          scale={scale}
          errorMessage={getApiErrorMessage(error, LOAD_ERROR_MESSAGE)}
          onRetry={() => void refetch()}
        />
      );
    } else if (folders.length === 0) {
      content = <FriendProfileMessage message={EMPTY_MESSAGE} scale={scale} />;
    } else {
      // 내 기록용 빈 상태는 가리고, 이 탭의 빈 상태는 위에서 따로 보여 준다.
      content = (
        <TravelFolderGrid
          folders={folders}
          onFolderClick={handleFolderClick}
          hideEmptyState
        />
      );
    }
  }

  return (
    <div className="flex flex-col">
      {/* 폴더 격자와 스켈레톤이 위쪽 여백(mt-7)을 자기가 갖고 있다. */}
      {dropdown ? <div>{dropdown}</div> : null}
      {content}
      {showLoadMoreError ? (
        <FriendListMessage
          variant="load-more-error"
          scale={scale}
          errorMessage={getApiErrorMessage(error, LOAD_MORE_ERROR_MESSAGE)}
          onRetry={() => void fetchNextPage()}
        />
      ) : null}
      <div ref={loadMoreRef} aria-hidden="true" />
      {isFetchingNextPage ? (
        <LoadingSpinner label="여행 폴더를 더 불러오는 중" />
      ) : null}
    </div>
  );
}

export default FriendFolderTab;
