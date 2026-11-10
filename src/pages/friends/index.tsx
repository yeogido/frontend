import { useCallback, useRef, useState, type ReactNode } from 'react';

import { getApiErrorMessage } from '../../apis/common';
import { LoadingSpinner } from '../../components/common';
import { ResponsivePageShell } from '../../components/layout';
import { useToast } from '../../components/toast';
import { useDeleteFriend, useFriends } from '../../hooks/useFriends';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import type { FriendSummary } from '../../types/friend.type';
import {
  FriendDeleteDialog,
  FriendListItem,
  FriendListMessage,
  FriendListSkeleton,
  FriendSearchBar,
} from './components';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { isFriendAlreadyDeletedError } from './utils/friendDeleteError';
import { toFriendKeyword } from './utils/friendKeyword';
import {
  canLoadMoreAutomatically,
  shouldShowLoadMoreError,
} from './utils/friendListStatus';

const SEARCH_DEBOUNCE_MS = 300;
const LOAD_MORE_ERROR_MESSAGE = '친구를 더 불러오지 못했어요.';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px.
const PAGE_TOP_PADDING = 12;
const PAGE_BOTTOM_PADDING = 40;
const SECTION_GAP = 12;
const TITLE_GAP = 6;
const TITLE_SIZE = 18;
const DESCRIPTION_SIZE = 14;
const LIST_GAP = 2;
const LOAD_MORE_SPACE = 16;

function FriendsPage() {
  const scale = useGlobalScale();
  const [query, setQuery] = useState('');
  // 입력은 디바운스 뒤에 검색어가 되고, Enter와 지우기는 기다리지 않고 바로 반영한다.
  const [keyword, setKeyword] = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
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

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: canLoadMoreAutomatically({ hasNextPage, isPending, isError }),
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
  } else if (friends.length === 0) {
    content = (
      <FriendListMessage
        variant={toFriendKeyword(keyword) ? 'search-empty' : 'empty'}
        scale={scale}
      />
    );
  } else {
    content = (
      <ul
        aria-label="친구 목록"
        className="flex flex-col"
        style={{ gap: LIST_GAP * scale }}
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
    );
  }

  return (
    <ResponsivePageShell
      mode="main-layout"
      topPadding={PAGE_TOP_PADDING}
      bottomPadding={PAGE_BOTTOM_PADDING}
      className="bg-background"
    >
      <div className="flex flex-col" style={{ gap: SECTION_GAP * scale }}>
        <div className="flex flex-col" style={{ gap: TITLE_GAP * scale }}>
          <h1
            ref={titleRef}
            tabIndex={-1}
            className="font-semibold text-black outline-none"
            style={{ fontSize: TITLE_SIZE * scale, lineHeight: 'normal' }}
          >
            친구 목록
          </h1>
          <p
            className="text-gray-5"
            style={{ fontSize: DESCRIPTION_SIZE * scale, lineHeight: 'normal' }}
          >
            등록된 친구들을 확인해 보세요
          </p>
        </div>
        <FriendSearchBar
          value={query}
          scale={scale}
          onChange={setQuery}
          onSubmit={() => setKeyword(query)}
          onClear={handleClear}
        />
        {content}
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
      {isFetchingNextPage ? (
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
    </ResponsivePageShell>
  );
}

export default FriendsPage;
