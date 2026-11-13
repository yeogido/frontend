import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { ResponsivePageShell } from '../../../components/layout';
import { useFriendProfile } from '../../../hooks/useFriendProfile';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useAuthStore } from '../../../store/auth.store';
import type { FriendProfile } from '../../../types/friend.type';
import FriendListMessage from '../components/FriendListMessage';
import FriendListSkeleton from '../components/FriendListSkeleton';
import { useFriendProfileActions } from '../hooks/useFriendProfileActions';
import {
  getFriendProfileErrorKind,
  getFriendProfileFailureMessage,
  parseFriendUserId,
} from '../utils/friendProfile';
import FriendCoursesTab from './components/FriendCoursesTab';
import FriendProfileHeader from './components/FriendProfileHeader';
import FriendProfileMessage from './components/FriendProfileMessage';
import FriendProfileTabs from './components/FriendProfileTabs';
import {
  DEFAULT_FRIEND_PROFILE_TAB,
  type FriendProfileTab,
} from './friendProfileTabs';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px.
const PAGE_TOP_PADDING = 12;
const PAGE_BOTTOM_PADDING = 40;
const SECTION_GAP = 24;

const NOT_FOUND_MESSAGE = '존재하지 않는 사용자예요.';
const COMING_SOON_MESSAGE = '준비 중이에요';

interface FriendProfileContentProps {
  friendUserId: number;
}

function FriendProfileContent({ friendUserId }: FriendProfileContentProps) {
  const scale = useGlobalScale();
  const [activeTab, setActiveTab] = useState<FriendProfileTab>(
    DEFAULT_FRIEND_PROFILE_TAB
  );
  const { profile, isPending, isError, error, refetch } =
    useFriendProfile(friendUserId);

  let content;

  if (isPending) {
    content = <FriendListSkeleton scale={scale} />;
  } else if (isError || !profile) {
    const kind = getFriendProfileErrorKind(error);

    // 내 ID로 조회하면 서버가 400을 준다. 화면에서 미리 걸러 내지만, 그래도
    // 응답으로 온 경우에는 내 프로필로 보낸다.
    if (kind === 'self') {
      return <Navigate to="/profile" replace />;
    }

    content =
      kind === 'not-found' ? (
        <FriendListMessage
          variant="error"
          scale={scale}
          errorMessage={NOT_FOUND_MESSAGE}
        />
      ) : (
        <FriendListMessage
          variant="error"
          scale={scale}
          errorMessage={getFriendProfileFailureMessage(error)}
          onRetry={() => void refetch()}
        />
      );
  } else {
    content = (
      <ProfileBody
        profile={profile}
        friendUserId={friendUserId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scale={scale}
      />
    );
  }

  return (
    <ResponsivePageShell
      mode="main-layout"
      topPadding={PAGE_TOP_PADDING}
      bottomPadding={PAGE_BOTTOM_PADDING}
      className="bg-background"
    >
      {content}
    </ResponsivePageShell>
  );
}

interface ProfileBodyProps {
  profile: FriendProfile;
  friendUserId: number;
  activeTab: FriendProfileTab;
  onTabChange: (tab: FriendProfileTab) => void;
  scale: number;
}

function ProfileBody({
  profile,
  friendUserId,
  activeTab,
  onTabChange,
  scale,
}: ProfileBodyProps) {
  const actions = useFriendProfileActions(profile);

  return (
    <div className="flex flex-col" style={{ gap: SECTION_GAP * scale }}>
      <FriendProfileHeader
        profile={profile}
        scale={scale}
        isActionPending={actions.isPending}
        onSendRequest={() => void actions.send()}
        onAccept={() => void actions.accept()}
      />
      <FriendProfileTabs
        value={activeTab}
        scale={scale}
        onChange={onTabChange}
      />
      <div role="tabpanel">
        {activeTab === 'courses' ? (
          <FriendCoursesTab friendUserId={friendUserId} scale={scale} />
        ) : (
          <FriendProfileMessage message={COMING_SOON_MESSAGE} scale={scale} />
        )}
      </div>
    </div>
  );
}

function FriendProfilePage() {
  const scale = useGlobalScale();
  const { friendUserId: friendUserIdParam } = useParams();
  const viewerUserId = useAuthStore((state) => state.userId);
  const friendUserId = parseFriendUserId(friendUserIdParam);

  if (friendUserId === null) {
    return (
      <ResponsivePageShell
        mode="main-layout"
        topPadding={PAGE_TOP_PADDING}
        bottomPadding={PAGE_BOTTOM_PADDING}
        className="bg-background"
      >
        <FriendListMessage
          variant="error"
          scale={scale}
          errorMessage={NOT_FOUND_MESSAGE}
        />
      </ResponsivePageShell>
    );
  }

  if (viewerUserId !== null && friendUserId === viewerUserId) {
    return <Navigate to="/profile" replace />;
  }

  return <FriendProfileContent friendUserId={friendUserId} />;
}

export default FriendProfilePage;
