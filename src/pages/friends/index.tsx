import { useCallback, useState, type ReactNode } from 'react';

import { getApiErrorMessage } from '../../apis/common';
import { LoadingSpinner } from '../../components/common';
import { ResponsivePageShell } from '../../components/layout';
import { useFriends } from '../../hooks/useFriends';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import {
  FriendListItem,
  FriendListMessage,
  FriendListSkeleton,
  FriendSearchBar,
} from './components';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { toFriendKeyword } from './utils/friendKeyword';

const SEARCH_DEBOUNCE_MS = 300;

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
  } = useFriends(keyword);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending && !isError,
    onIntersect: handleLoadMore,
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
          <FriendListItem key={friend.userId} friend={friend} scale={scale} />
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
            className="font-semibold text-black"
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

      <div ref={loadMoreRef} aria-hidden="true" />
      {isFetchingNextPage ? (
        <LoadingSpinner label="친구 목록을 더 불러오는 중" />
      ) : null}
      <div style={{ height: LOAD_MORE_SPACE * scale }} aria-hidden="true" />
    </ResponsivePageShell>
  );
}

export default FriendsPage;
