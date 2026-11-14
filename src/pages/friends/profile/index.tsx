import { Navigate, useParams, useSearchParams } from 'react-router-dom';

import { ResponsivePageShell } from '../../../components/layout';
import DesktopPageShell from '../../../components/layout/desktop/DesktopPageShell';
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
import FriendFolderTab from './components/FriendFolderTab';
import FriendProfileHeader from './components/FriendProfileHeader';
import FriendProfileTabs from './components/FriendProfileTabs';
import FriendTravelMapTab from './components/FriendTravelMapTab';
import {
  FRIEND_PROFILE_TAB_PARAM,
  getFriendProfilePanelId,
  getFriendProfileTabId,
  parseFriendProfileTab,
  withFriendProfileTab,
  type FriendProfileTab,
} from './friendProfileTabs';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px.
const PAGE_TOP_PADDING = 12;
const PAGE_BOTTOM_PADDING = 40;
const SECTION_GAP = 24;

const NOT_FOUND_MESSAGE = '존재하지 않는 사용자예요.';

interface FriendProfileContentProps {
  friendUserId: number;
  desktop: boolean;
}

function FriendProfileContent({
  friendUserId,
  desktop,
}: FriendProfileContentProps) {
  const mobileScale = useGlobalScale();
  const scale = desktop ? 1 : mobileScale;
  const [searchParams, setSearchParams] = useSearchParams();
  // 탭은 URL이 정한다. 지도에서 상세에 갔다가 뒤로 와도 보던 탭이 그대로이고,
  // 잘못된 값은 기본 탭으로 보되 URL은 고쳐 쓰지 않는다.
  const activeTab = parseFriendProfileTab(
    searchParams.get(FRIEND_PROFILE_TAB_PARAM)
  );
  const handleTabChange = (tab: FriendProfileTab) => {
    if (tab === activeTab) return;

    setSearchParams((previous) => withFriendProfileTab(previous, tab), {
      replace: true,
    });
  };
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
        onTabChange={handleTabChange}
        scale={scale}
        desktop={desktop}
      />
    );
  }

  if (desktop) return <DesktopPageShell>{content}</DesktopPageShell>;

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
  desktop: boolean;
}

function ProfileBody({
  profile,
  friendUserId,
  activeTab,
  onTabChange,
  scale,
  desktop,
}: ProfileBodyProps) {
  const actions = useFriendProfileActions(profile);

  return (
    <div
      className="flex flex-col"
      style={{ gap: (desktop ? 32 : SECTION_GAP) * scale }}
    >
      <FriendProfileHeader
        profile={profile}
        scale={scale}
        desktop={desktop}
        isActionPending={actions.isPending}
        onSendRequest={() => void actions.send()}
        onAccept={() => void actions.accept()}
      />
      <FriendProfileTabs
        value={activeTab}
        scale={scale}
        desktop={desktop}
        onChange={onTabChange}
      />
      <div
        role="tabpanel"
        id={getFriendProfilePanelId(activeTab)}
        aria-labelledby={getFriendProfileTabId(activeTab)}
      >
        {activeTab === 'courses' ? (
          <FriendCoursesTab
            friendUserId={friendUserId}
            scale={scale}
            desktop={desktop}
          />
        ) : activeTab === 'map' ? (
          <FriendTravelMapTab
            friendUserId={friendUserId}
            nickname={profile.nickname}
            scale={scale}
            desktop={desktop}
          />
        ) : (
          <FriendFolderTab friendUserId={friendUserId} scale={scale} />
        )}
      </div>
    </div>
  );
}

function FriendProfilePage({ desktop = false }: { desktop?: boolean }) {
  const scale = useGlobalScale();
  const { friendUserId: friendUserIdParam } = useParams();
  const viewerUserId = useAuthStore((state) => state.userId);
  const friendUserId = parseFriendUserId(friendUserIdParam);

  if (friendUserId === null) {
    if (desktop) {
      return (
        <DesktopPageShell>
          <FriendListMessage
            variant="error"
            scale={1}
            errorMessage={NOT_FOUND_MESSAGE}
          />
        </DesktopPageShell>
      );
    }
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

  return <FriendProfileContent friendUserId={friendUserId} desktop={desktop} />;
}

export default FriendProfilePage;
