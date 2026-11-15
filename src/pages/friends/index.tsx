import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MdPersonAdd } from 'react-icons/md';
import requestsNotificationIcon from '../../assets/icons/friend-requests-notification.svg';
import { useIsFetching } from '@tanstack/react-query';

import { getApiErrorMessage } from '../../apis/common';
import { LoadingSpinner } from '../../components/common';
import { ResponsivePageShell } from '../../components/layout';
import DesktopPageShell from '../../components/layout/desktop/DesktopPageShell';
import { useToast } from '../../components/toast';
import { useFriendSearch } from '../../hooks/useFriendSearch';
import {
  FRIENDS_QUERY_PREFIX,
  useDeleteFriend,
  useFriends,
} from '../../hooks/useFriends';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useReceivedFriendRequests } from '../../hooks/useFriendRequests';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import {
  mergeFriendSearchResults,
  selectNextPageSource,
} from '../../hooks/utils/friendSearchPages';
import { useAuthStore } from '../../store/auth.store';
import type { FriendSummary } from '../../types/friend.type';
import {
  FriendDeleteDialog,
  FriendListItem,
  FriendListMessage,
  FriendListSkeleton,
  FriendSearchBar,
  FriendSearchResultRow,
} from './components';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useFriendSearchActions } from './hooks/useFriendSearchActions';
import { isFriendAlreadyDeletedError } from './utils/friendDeleteError';
import { toFriendKeyword } from './utils/friendKeyword';
import { shouldShowLoadMoreError } from './utils/friendListStatus';

const SEARCH_DEBOUNCE_MS = 300;
const KEYWORD_PARAM = 'keyword';
const LOAD_MORE_ERROR_MESSAGE = '친구를 더 불러오지 못했어요.';
const SEARCH_ERROR_MESSAGE = '새로운 친구를 불러오지 못했어요.';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px.
const PAGE_TOP_PADDING = 12;
const PAGE_BOTTOM_PADDING = 40;
const SECTION_GAP = 12;
const TITLE_GAP = 6;
const TITLE_SIZE = 18;
const DESCRIPTION_SIZE = 14;
const LIST_GAP = 2;
const LOAD_MORE_SPACE = 16;

function DesktopFriendRequestsLink() {
  const { requests } = useReceivedFriendRequests();
  return (
    <Link
      to="/friends/requests"
      aria-label="친구 요청 확인"
      className="p-2 text-[24px] text-black"
    >
      {requests.length > 0 ? (
        <img src={requestsNotificationIcon} alt="" />
      ) : (
        <MdPersonAdd aria-hidden="true" />
      )}
    </Link>
  );
}

function FriendsPage({ desktop = false }: { desktop?: boolean }) {
  const mobileScale = useGlobalScale();
  const scale = desktop ? 1 : mobileScale;
  const [searchParams, setSearchParams] = useSearchParams();
  // 프로필에 다녀와도 검색어가 남도록 URL(?keyword=)에 둔다. 읽는 건 마운트할 때뿐이고,
  // 이후 입력창은 이 로컬 상태가 제어한다(한글 조합 중 글자가 URL 갱신에 덮이지 않게).
  const [query, setQuery] = useState(
    () => searchParams.get(KEYWORD_PARAM) ?? ''
  );
  // 입력은 디바운스 뒤에 검색어가 되고, Enter와 지우기는 기다리지 않고 바로 반영한다.
  const [keyword, setKeyword] = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  // 디바운스를 거친 검색어만 URL에 반영한다. replace라 입력할 때마다 히스토리가
  // 쌓이지 않고, URL과 같으면 아무것도 하지 않아 갱신이 되풀이되지 않는다.
  useEffect(() => {
    const current = searchParams.get(KEYWORD_PARAM) ?? '';
    const next = toFriendKeyword(keyword) ?? '';

    if (next === current) return;

    setSearchParams(next ? { [KEYWORD_PARAM]: next } : {}, { replace: true });
  }, [keyword, searchParams, setSearchParams]);
  const {
    friends,
    isPending,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useFriends(keyword);
  const userId = useAuthStore((state) => state.userId);
  const hasKeyword = toFriendKeyword(keyword) !== undefined;
  // 새 친구 검색은 친구 목록과 병렬로 미리 받고, 친구 목록이 소진된 뒤에 이어 보여 준다.
  const search = useFriendSearch(keyword);
  const searchActions = useFriendSearchActions();
  // useFriends는 재조회 여부를 알려 주지 않아, 친구 쪽 조회가 진행 중인지는 캐시에서 본다.
  const isFriendsFetching =
    useIsFetching({ queryKey: [FRIENDS_QUERY_PREFIX, userId] }) > 0;
  const { showToast } = useToast();
  const deleteFriend = useDeleteFriend();
  const [deleteTarget, setDeleteTarget] = useState<FriendSummary | null>(null);
  const deleteTriggerRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const handleDeleteClick = (friend: FriendSummary, trigger: HTMLElement) => {
    deleteTriggerRef.current = trigger;
    setDeleteTarget(friend);
  };

  // 취소·닫기는 눌렀던 삭제 버튼으로 돌아간다. 삭제가 끝나면 그 줄이 목록에서
  // 사라지므로 제목으로 보내, 포커스가 문서 맨 위로 날아가지 않게 한다.
  const closeDeleteDialog = (focusTarget: HTMLElement | null) => {
    setDeleteTarget(null);
    focusTarget?.focus();
  };

  const handleDeleteCancel = () => {
    const trigger = deleteTriggerRef.current;

    closeDeleteDialog(trigger?.isConnected ? trigger : titleRef.current);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteFriend.mutateAsync(deleteTarget.userId);
      closeDeleteDialog(titleRef.current);
      showToast('친구를 삭제했어요.');
    } catch (deleteError) {
      if (isFriendAlreadyDeletedError(deleteError)) {
        closeDeleteDialog(titleRef.current);
        void refetch();
        showToast('이미 친구가 아니에요. 목록을 새로 불러왔어요.');
        return;
      }

      showToast(getApiErrorMessage(deleteError, '친구 삭제에 실패했어요.'));
    }
  };

  const nextPageSource = selectNextPageSource({
    friends: { isPending, isError, hasNextPage: Boolean(hasNextPage) },
    search: {
      isError: search.isError,
      hasNextPage: hasKeyword && Boolean(search.hasNextPage),
    },
    isAnyFetching: isFriendsFetching || (hasKeyword && search.isFetching),
  });
  const { fetchNextPage: fetchNextSearchPage } = search;

  const handleLoadMore = useCallback(() => {
    if (nextPageSource === 'friends') {
      void fetchNextPage();
    } else if (nextPageSource === 'search') {
      void fetchNextSearchPage();
    }
  }, [fetchNextPage, fetchNextSearchPage, nextPageSource]);

  const loadMoreRef = useInfiniteScroll({
    enabled: nextPageSource !== null,
    onIntersect: handleLoadMore,
  });

  const showLoadMoreError = shouldShowLoadMoreError({
    isFetchNextPageError,
    isFetchingNextPage,
    friendCount: friends.length,
  });

  const handleClear = () => {
    setQuery('');
    setKeyword('');
  };

  // 친구 목록이 소진된 뒤에만 새 친구 결과를 이어 붙인다.
  const showNewFriends = hasKeyword && !isPending && !hasNextPage;
  const newFriends = useMemo(
    () =>
      showNewFriends ? mergeFriendSearchResults(friends, search.items) : [],
    [friends, search.items, showNewFriends]
  );
  // 다시 시도하는 동안(isFetching)은 안내 대신 스피너가 보이게 가린다.
  const showSearchError =
    showNewFriends && search.isError && !search.isFetching;
  const retrySearch = () =>
    void (search.isFetchNextPageError
      ? search.fetchNextPage()
      : search.refetch());
  const isSearchLoading =
    showNewFriends && (search.isPending || search.isFetching);

  let content: ReactNode;

  if (isPending) {
    content = <FriendListSkeleton scale={scale} />;
  } else if (isError && friends.length === 0) {
    content = (
      <FriendListMessage
        variant="error"
        scale={scale}
        errorMessage={getApiErrorMessage(
          error,
          '친구 목록을 불러오지 못했어요.'
        )}
        onRetry={() => void refetch()}
      />
    );
  } else if (friends.length === 0 && newFriends.length === 0) {
    if (!hasKeyword) {
      content = <FriendListMessage variant="empty" scale={scale} />;
    } else if (showSearchError) {
      content = (
        <FriendListMessage
          variant="error"
          scale={scale}
          errorMessage={SEARCH_ERROR_MESSAGE}
          onRetry={retrySearch}
        />
      );
    } else if (isSearchLoading) {
      content = <FriendListSkeleton scale={scale} />;
    } else {
      content = <FriendListMessage variant="no-result" scale={scale} />;
    }
  } else {
    content = (
      <div
        className="flex flex-col"
        style={{ gap: (desktop ? 8 : LIST_GAP) * scale }}
      >
        {friends.length > 0 ? (
          <ul
            aria-label="친구 목록"
            className="flex flex-col"
            style={{ gap: (desktop ? 8 : LIST_GAP) * scale }}
          >
            {friends.map((friend) => (
              <FriendListItem
                key={friend.userId}
                friend={friend}
                scale={scale}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </ul>
        ) : null}
        {newFriends.length > 0 ? (
          <ul
            aria-label="새로운 친구 검색 결과"
            className="flex flex-col"
            style={{ gap: (desktop ? 8 : LIST_GAP) * scale }}
          >
            {newFriends.map((friend) => (
              <FriendSearchResultRow
                key={friend.userId}
                friend={friend}
                scale={scale}
                isPending={searchActions.pendingIds.has(friend.userId)}
                onSendRequest={(target) => void searchActions.send(target)}
                onAccept={(target) => void searchActions.accept(target)}
              />
            ))}
          </ul>
        ) : null}
        {showSearchError ? (
          <FriendListMessage
            variant="load-more-error"
            scale={scale}
            errorMessage={SEARCH_ERROR_MESSAGE}
            onRetry={retrySearch}
          />
        ) : null}
      </div>
    );
  }

  const pageContent = (
    <>
      <div
        className="flex flex-col"
        style={{ gap: (desktop ? 32 : SECTION_GAP) * scale }}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col" style={{ gap: TITLE_GAP * scale }}>
            <h1
              ref={titleRef}
              tabIndex={-1}
              className="font-semibold text-black outline-none"
              style={{
                fontSize: (desktop ? 32 : TITLE_SIZE) * scale,
                lineHeight: 'normal',
              }}
            >
              친구 목록
            </h1>
            <p
              className="text-gray-5"
              style={{
                fontSize: (desktop ? 20 : DESCRIPTION_SIZE) * scale,
                lineHeight: desktop ? 1.5 : 'normal',
              }}
            >
              등록된 친구들을 확인해 보세요
            </p>
          </div>
          {desktop ? <DesktopFriendRequestsLink /> : null}
        </div>
        <div
          className="flex flex-col"
          style={{ gap: (desktop ? 20 : SECTION_GAP) * scale }}
        >
          <FriendSearchBar
            value={query}
            scale={scale}
            desktop={desktop}
            onChange={setQuery}
            onSubmit={() => setKeyword(query)}
            onClear={handleClear}
          />
          {content}
        </div>
      </div>

      {showLoadMoreError ? (
        <FriendListMessage
          variant="load-more-error"
          scale={scale}
          errorMessage={getApiErrorMessage(error, LOAD_MORE_ERROR_MESSAGE)}
          onRetry={() => void fetchNextPage()}
        />
      ) : null}

      <div ref={loadMoreRef} aria-hidden="true" />
      {isFetchingNextPage || search.isFetchingNextPage ? (
        <LoadingSpinner label="친구 목록을 더 불러오는 중" />
      ) : null}
      <div style={{ height: LOAD_MORE_SPACE * scale }} aria-hidden="true" />

      <FriendDeleteDialog
        friend={deleteTarget}
        isPending={deleteFriend.isPending}
        scale={scale}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={handleDeleteCancel}
      />
    </>
  );

  return desktop ? (
    <DesktopPageShell>{pageContent}</DesktopPageShell>
  ) : (
    <ResponsivePageShell
      mode="main-layout"
      topPadding={PAGE_TOP_PADDING}
      bottomPadding={PAGE_BOTTOM_PADDING}
      className="bg-background"
    >
      {pageContent}
    </ResponsivePageShell>
  );
}

export default FriendsPage;
