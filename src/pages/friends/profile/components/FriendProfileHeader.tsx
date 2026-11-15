import { getSearchRowAction } from '../../utils/friendSearchRow';
import {
  getProfileActionAriaLabel,
  getProfileSubtitle,
} from '../../utils/friendProfile';
import type { FriendProfile } from '../../../../types/friend.type';
import FriendAvatar from '../../components/FriendAvatar';
import FriendRequestButton from '../../components/FriendRequestButton';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px. scale은 useGlobalScale 값이다.
const ROW_GAP = 16;
const AVATAR_SIZE = 48;
const TEXT_GAP = 2;
const NAME_SIZE = 16;
const SUBTITLE_SIZE = 14;

interface FriendProfileHeaderProps {
  profile: FriendProfile;
  scale: number;
  desktop?: boolean;
  /** 관계 버튼 요청이 진행 중이면 버튼을 막는다. */
  isActionPending: boolean;
  onSendRequest: () => void;
  onAccept: () => void;
}

/** 아바타, 이름, 이메일(친구가 아니면 친구 코드)과 관계에 따른 버튼. */
function FriendProfileHeader({
  profile,
  scale,
  desktop = false,
  isActionPending,
  onSendRequest,
  onAccept,
}: FriendProfileHeaderProps) {
  const action = getSearchRowAction(profile.relationStatus, profile.requestId);

  return (
    <div
      className="flex items-center justify-between"
      style={{ gap: ROW_GAP * scale }}
    >
      <div
        className="flex min-w-0 items-center"
        style={{ gap: (desktop ? 32 : ROW_GAP) * scale }}
      >
        <FriendAvatar
          userId={profile.userId}
          nickname={profile.nickname}
          profileImageUrl={profile.profileImageUrl}
          size={(desktop ? 100 : AVATAR_SIZE) * scale}
        />
        <div
          className="flex min-w-0 flex-col font-medium"
          style={{ gap: TEXT_GAP * scale, lineHeight: 'normal' }}
        >
          <h1
            className="truncate text-black"
            style={{ fontSize: (desktop ? 24 : NAME_SIZE) * scale }}
          >
            {profile.nickname}
          </h1>
          <p
            className="text-gray-3 truncate"
            style={{ fontSize: (desktop ? 16 : SUBTITLE_SIZE) * scale }}
          >
            {getProfileSubtitle(profile)}
          </p>
        </div>
      </div>
      {action ? (
        <div className="shrink-0">
          <FriendRequestButton
            variant={action.variant}
            scale={scale}
            disabled={action.disabled || isActionPending}
            aria-label={getProfileActionAriaLabel(
              action.kind,
              profile.nickname
            )}
            onClick={action.kind === 'accept' ? onAccept : onSendRequest}
          >
            {action.label}
          </FriendRequestButton>
        </div>
      ) : null}
    </div>
  );
}

export default FriendProfileHeader;
