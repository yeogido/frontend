import { useCallback, type ReactNode } from 'react';

import { getApiErrorMessage } from '../../../apis/common';
import { LoadingSpinner } from '../../../components/common';
import { ResponsivePageShell } from '../../../components/layout';
import {
  useReceivedFriendRequests,
  useSentFriendRequests,
} from '../../../hooks/useFriendRequests';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import FriendListMessage from '../components/FriendListMessage';
import FriendListSkeleton from '../components/FriendListSkeleton';
import FriendRequestButton from '../components/FriendRequestButton';
import FriendUserRow from '../components/FriendUserRow';
import SentRequestsCard from '../components/SentRequestsCard';
import { useFriendRequestActions } from '../hooks/useFriendRequestActions';
import {
  canLoadMoreAutomatically,
  shouldShowLoadMoreError,
} from '../utils/friendListStatus';

const EMPTY_MESSAGE = '받은 친구 요청이 없어요.';
const LOAD_ERROR_MESSAGE = '친구 요청을 불러오지 못했어요.';
const LOAD_MORE_ERROR_MESSAGE = '친구 요청을 더 불러오지 못했어요.';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px.
const PAGE_TOP_PADDING = 12;
const PAGE_BOTTOM_PADDING = 40;
const SECTION_GAP = 12;
const TITLE_GAP = 6;
const TITLE_SIZE = 18;
const DESCRIPTION_SIZE = 14;
const LIST_GAP = 2;
const LOAD_MORE_SPACE = 16;
const EMPTY_TOP_SPACE = 110;
const EMPTY_TOP_SPACE_WITH_CARD = 24;
const EMPTY_MESSAGE_SIZE = 16;
const EMPTY_MESSAGE_LINE_HEIGHT = 22;

function FriendRequestsPage() {
  const scale = useGlobalScale();
  const received = useReceivedFriendRequests();
  const sent = useSentFriendRequests();
  const { pendingIds, accept, reject, cancel } = useFriendRequestActions({
    refetchReceived: received.refetch,
    refetchSent: sent.refetch,
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = received;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: canLoadMoreAutomatically({
      hasNextPage,
      isPending: received.isPending,
      isError: received.isError,
    }),
    onIntersect: handleLoadMore,
  });

  const showLoadMoreError = shouldShowLoadMoreError({
    isFetchNextPageError: received.isFetchNextPageError,
    isFetchingNextPage,
    friendCount: received.requests.length,
  });
  const hasSentCard = sent.requests.length > 0;

  let content: ReactNode;

  if (received.isPending) {
    content = <FriendListSkeleton scale={scale} />;
  } else if (received.isError && received.requests.length === 0) {
    content = (
      <FriendListMessage
        variant="error"
        scale={scale}
        errorMessage={getApiErrorMessage(received.error, LOAD_ERROR_MESSAGE)}
        onRetry={() => void received.refetch()}
      />
    );
  } else if (received.requests.length === 0) {
    content = (
      <section
        role="status"
        className="text-gray-4 text-center font-medium"
        style={{
          paddingTop:
            (hasSentCard ? EMPTY_TOP_SPACE_WITH_CARD : EMPTY_TOP_SPACE) * scale,
          fontSize: EMPTY_MESSAGE_SIZE * scale,
          lineHeight: `${EMPTY_MESSAGE_LINE_HEIGHT * scale}px`,
        }}
      >
        {EMPTY_MESSAGE}
      </section>
    );
  } else {
    content = (
      <ul
        aria-label="받은 친구 요청"
        className="flex flex-col"
        style={{ gap: LIST_GAP * scale }}
      >
        {received.requests.map((request) => {
          const isPending = pendingIds.has(request.requestId);
          const { nickname } = request.requester;

          return (
            <FriendUserRow
              key={request.requestId}
              friend={request.requester}
              scale={scale}
              actions={
                <>
                  <FriendRequestButton
                    variant="accept"
                    scale={scale}
                    disabled={isPending}
                    aria-label={`${nickname}의 친구 요청 수락`}
                    onClick={() => void accept(request.requestId)}
                  >
                    수락
                  </FriendRequestButton>
                  <FriendRequestButton
                    variant="neutral"
                    scale={scale}
                    disabled={isPending}
                    aria-label={`${nickname}의 친구 요청 삭제`}
                    onClick={() => void reject(request.requestId)}
                  >
                    삭제
                  </FriendRequestButton>
                </>
              }
            />
          );
        })}
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
            친구 요청
          </h1>
          <p
            className="text-gray-5"
            style={{ fontSize: DESCRIPTION_SIZE * scale, lineHeight: 'normal' }}
          >
            새로운 친구 요청을 확인해 보세요
          </p>
        </div>
        <SentRequestsCard
          requests={sent.requests}
          scale={scale}
          pendingIds={pendingIds}
          hasNextPage={Boolean(sent.hasNextPage)}
          isFetchingNextPage={sent.isFetchingNextPage}
          onCancel={(requestId) => void cancel(requestId)}
          onLoadMore={() => void sent.fetchNextPage()}
        />
        {content}
      </div>

      {showLoadMoreError ? (
        <FriendListMessage
          variant="load-more-error"
          scale={scale}
          errorMessage={getApiErrorMessage(
            received.error,
            LOAD_MORE_ERROR_MESSAGE
          )}
          onRetry={() => void received.fetchNextPage()}
        />
      ) : null}

      <div ref={loadMoreRef} aria-hidden="true" />
      {isFetchingNextPage ? (
        <LoadingSpinner label="친구 요청을 더 불러오는 중" />
      ) : null}
      <div style={{ height: LOAD_MORE_SPACE * scale }} aria-hidden="true" />
    </ResponsivePageShell>
  );
}

export default FriendRequestsPage;
