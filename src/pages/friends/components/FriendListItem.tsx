import NicknameAvatar from '../../../components/common/NicknameAvatar';
import type { FriendSummary } from '../../../types/friend.type';
import { getFriendAvatarColor } from '../utils/friendAvatarColor';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px. scale은 useGlobalScale 값이다.
const ROW_PADDING_Y = 12;
const ROW_GAP = 16;
const AVATAR_SIZE = 48;
const TEXT_GAP = 2;
const NAME_SIZE = 16;
const CODE_SIZE = 14;
const BUTTON_PADDING_X = 12;
const BUTTON_PADDING_Y = 8;
const BUTTON_TEXT_SIZE = 12;

interface FriendListItemProps {
  friend: FriendSummary;
  scale: number;
  onDeleteClick?: (friend: FriendSummary) => void;
}

function FriendListItem({ friend, scale, onDeleteClick }: FriendListItemProps) {
  return (
    <li
      className="flex items-center justify-between"
      style={{ gap: ROW_GAP * scale, paddingBlock: ROW_PADDING_Y * scale }}
    >
      <div
        className="flex min-w-0 items-center"
        style={{ gap: ROW_GAP * scale }}
      >
        <NicknameAvatar
          name={friend.nickname}
          color={getFriendAvatarColor(friend.userId)}
          size={AVATAR_SIZE * scale}
        />
        <div
          className="flex min-w-0 flex-col font-medium"
          style={{ gap: TEXT_GAP * scale, lineHeight: 'normal' }}
        >
          <p
            className="truncate text-black"
            style={{ fontSize: NAME_SIZE * scale }}
          >
            {friend.nickname}
          </p>
          <p
            className="text-gray-3 truncate"
            style={{ fontSize: CODE_SIZE * scale }}
          >
            {friend.friendCode}
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-label={`${friend.nickname} 친구 삭제`}
        onClick={() => onDeleteClick?.(friend)}
        className="border-gray-2 text-gray-4 relative shrink-0 rounded-full border bg-white font-medium before:absolute before:-inset-x-1 before:-inset-y-1.5 before:content-['']"
        style={{
          padding: `${BUTTON_PADDING_Y * scale}px ${BUTTON_PADDING_X * scale}px`,
          fontSize: BUTTON_TEXT_SIZE * scale,
          lineHeight: 'normal',
        }}
      >
        친구 삭제
      </button>
    </li>
  );
}

export default FriendListItem;
