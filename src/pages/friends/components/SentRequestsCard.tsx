import { useId } from 'react';

import type { SentFriendRequest } from '../../../types/friend.type';
import FriendRequestButton from './FriendRequestButton';
import FriendUserRow from './FriendUserRow';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px. scale은 useGlobalScale 값이다.
const CARD_RADIUS = 12;
const CARD_PADDING_X = 16;
const CARD_PADDING_Y = 12;
const TITLE_SIZE = 14;
const TITLE_GAP = 4;
const LIST_GAP = 2;
const MORE_PADDING_Y = 8;
const MORE_TEXT_SIZE = 12;

interface SentRequestsCardProps {
  requests: SentFriendRequest[];
  scale: number;
  pendingIds: ReadonlySet<number>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onCancel: (requestId: number) => void;
  onLoadMore: () => void;
}

/** 내가 보낸 요청을 모아 보여 주는 회색 카드. 보낸 요청이 없으면 그리지 않는다. */
function SentRequestsCard({
  requests,
  scale,
  pendingIds,
  hasNextPage,
  isFetchingNextPage,
  onCancel,
  onLoadMore,
}: SentRequestsCardProps) {
  const titleId = useId();

  if (requests.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={titleId}
      className="bg-gray-2 flex flex-col"
      style={{
        gap: TITLE_GAP * scale,
        padding: `${CARD_PADDING_Y * scale}px ${CARD_PADDING_X * scale}px`,
        borderRadius: CARD_RADIUS * scale,
      }}
    >
      <h2
        id={titleId}
        className="text-gray-3 font-medium"
        style={{ fontSize: TITLE_SIZE * scale, lineHeight: 'normal' }}
      >
        내가 보낸 요청
      </h2>
      <ul className="flex flex-col" style={{ gap: LIST_GAP * scale }}>
        {requests.map((request) => (
          <FriendUserRow
            key={request.requestId}
            friend={request.receiver}
            scale={scale}
            actions={
              <FriendRequestButton
                variant="neutral"
                scale={scale}
                disabled={pendingIds.has(request.requestId)}
                aria-label={`${request.receiver.nickname}에게 보낸 친구 요청 취소`}
                onClick={() => onCancel(request.requestId)}
              >
                취소
              </FriendRequestButton>
            }
          />
        ))}
      </ul>
      {hasNextPage ? (
        <button
          type="button"
          disabled={isFetchingNextPage}
          onClick={onLoadMore}
          className="text-gray-4 self-center font-medium disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            paddingBlock: MORE_PADDING_Y * scale,
            fontSize: MORE_TEXT_SIZE * scale,
            lineHeight: 'normal',
          }}
        >
          {isFetchingNextPage ? '불러오는 중' : '더 보기'}
        </button>
      ) : null}
    </section>
  );
}

export default SentRequestsCard;
