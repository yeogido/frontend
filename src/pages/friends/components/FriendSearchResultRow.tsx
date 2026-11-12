import type { SearchedFriend } from '../../../types/friend.type';
import { getSearchRowAction } from '../utils/friendSearchRow';
import FriendRequestButton from './FriendRequestButton';
import FriendUserRow from './FriendUserRow';

interface FriendSearchResultRowProps {
  friend: SearchedFriend;
  scale: number;
  /** 이 행의 요청이 진행 중이면 버튼을 막는다. */
  isPending: boolean;
  onSendRequest: (friend: SearchedFriend) => void;
  onAccept: (friend: SearchedFriend) => void;
}

const ARIA_LABELS = {
  send: (nickname: string) => `${nickname} 친구 맺기`,
  requested: (nickname: string) => `${nickname} 친구 요청됨`,
  accept: (nickname: string) => `${nickname}의 친구 요청 수락`,
} as const;

/** 내 친구가 아닌 검색 결과. 관계 상태에 맞는 버튼이 오른쪽에 놓인다. */
function FriendSearchResultRow({
  friend,
  scale,
  isPending,
  onSendRequest,
  onAccept,
}: FriendSearchResultRowProps) {
  const action = getSearchRowAction(friend.relationStatus, friend.requestId);

  return (
    <FriendUserRow
      friend={friend}
      scale={scale}
      actions={
        action ? (
          <FriendRequestButton
            variant={action.variant}
            scale={scale}
            disabled={action.disabled || isPending}
            aria-label={ARIA_LABELS[action.kind](friend.nickname)}
            onClick={() =>
              action.kind === 'accept'
                ? onAccept(friend)
                : onSendRequest(friend)
            }
          >
            {action.label}
          </FriendRequestButton>
        ) : null
      }
    />
  );
}

export default FriendSearchResultRow;
