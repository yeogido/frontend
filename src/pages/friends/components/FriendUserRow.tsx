import type { ReactNode } from 'react';

import type { FriendSummary } from '../../../types/friend.type';
import FriendAvatar from './FriendAvatar';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px. scale은 useGlobalScale 값이다.
const ROW_PADDING_Y = 12;
const ROW_GAP = 16;
const AVATAR_SIZE = 48;
const TEXT_GAP = 2;
const NAME_SIZE = 16;
const CODE_SIZE = 14;

interface FriendUserRowProps {
  friend: FriendSummary;
  scale: number;
  /** 행 오른쪽에 놓이는 버튼들. */
  actions: ReactNode;
}

/** 아바타, 이름, 친구 코드와 오른쪽 버튼 자리로 이루어진 행. */
function FriendUserRow({ friend, scale, actions }: FriendUserRowProps) {
  return (
    <li
      className="flex items-center justify-between"
      style={{ gap: ROW_GAP * scale, paddingBlock: ROW_PADDING_Y * scale }}
    >
      <div
        className="flex min-w-0 items-center"
        style={{ gap: ROW_GAP * scale }}
      >
        <FriendAvatar
          userId={friend.userId}
          nickname={friend.nickname}
          profileImageUrl={friend.profileImageUrl}
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
      <div className="flex shrink-0 items-center" style={{ gap: 4 * scale }}>
        {actions}
      </div>
    </li>
  );
}

export default FriendUserRow;
