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
import {
  canFetchNextRequestPage,
  shouldShowSentRequestsCard,
} from '../../../hooks/utils/friendRequestPages';
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
const SENT_LOAD_ERROR_MESSAGE = '보낸 요청을 불러오지 못했어요.';
const SENT_LOAD_MORE_ERROR_MESSAGE = '보낸 요청을 더 불러오지 못했어요.';

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

  const { fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    received;

  // 진행 중인 조회(처음 조회, 재조회 포함)가 있으면 다음 페이지를 받지 않는다.
  const handleLoadMore = useCallback(() => {
    if (
      canFetchNextRequestPage({
        hasNextPage: Boolean(hasNextPage),
        isFetching,
        isFetchingNextPage,
      })
    ) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

  const handleSentLoadMore = () => {
    if (
      canFetchNextRequestPage({
        hasNextPage: Boolean(sent.hasNextPage),
        isFetching: sent.isFetching,
        isFetchingNextPage: sent.isFetchingNextPage,
      })
    ) {
      void sent.fetchNextPage();
    }
  };

  // 자동으로 이어 받기는 오류가 없을 때만 한다. isError는 다음 페이지 실패와
  // 재조회 실패 모두에서 true라서, 오류가 난 뒤에는 목록 아래의 "다시 시도"로만
  // 이어 가고 같은 요청을 끝없이 반복하지 않는다.
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
  // 캐시된 행이 있는 채로 목록 전체를 다시 받다 실패한 경우(수락 뒤 무효화나
  // 실패 후 재조회 등). 행은 그대로 두고 목록 아래에서 다시 시도하게 한다.
  const showRefetchError =
    received.isRefetchError && !isFetching && received.requests.length > 0;
  const isRetryingRefetch = received.isRefetchError && isFetching;

  const sentLoadFailed =
    sent.isError &&
    !sent.isFetchNextPageError &&
    !sent.isFetching &&
    sent.requests.length === 0;
  const sentLoadMoreFailed =
    sent.isFetchNextPageError && !sent.isFetching && sent.requests.length > 0;
  const sentErrorMessage = sentLoadFailed
    ? getApiErrorMessage(sent.error, SENT_LOAD_ERROR_MESSAGE)
    : sentLoadMoreFailed
      ? getApiErrorMessage(sent.error, SENT_LOAD_MORE_ERROR_MESSAGE)
      : null;
  const hasSentCard = shouldShowSentRequestsCard({
    requestCount: sent.requests.length,
    hasNextPage: Boolean(sent.hasNextPage),
    hasError: sentErrorMessage !== null,
  });

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
          isFetching={sent.isFetching}
          isFetchingNextPage={sent.isFetchingNextPage}
          errorMessage={sentErrorMessage}
          onRetry={() =>
            void (sentLoadFailed ? sent.refetch() : sent.fetchNextPage())
          }
          onCancel={(requestId) => void cancel(requestId)}
          onLoadMore={handleSentLoadMore}
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

      {showRefetchError ? (
        <FriendListMessage
          variant="load-more-error"
          scale={scale}
          errorMessage={getApiErrorMessage(received.error, LOAD_ERROR_MESSAGE)}
          onRetry={() => void received.refetch()}
        />
      ) : null}

      <div ref={loadMoreRef} aria-hidden="true" />
      {isFetchingNextPage ? (
        <LoadingSpinner label="친구 요청을 더 불러오는 중" />
      ) : null}
      {isRetryingRefetch ? (
        <LoadingSpinner label="친구 요청을 불러오는 중" />
      ) : null}
      <div style={{ height: LOAD_MORE_SPACE * scale }} aria-hidden="true" />
    </ResponsivePageShell>
  );
}

export default FriendRequestsPage;
