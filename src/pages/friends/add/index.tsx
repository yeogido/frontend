import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ResponsivePageShell } from '../../../components/layout';
import DesktopPageShell from '../../../components/layout/desktop/DesktopPageShell';
import { useToast } from '../../../components/toast';
import { useAcceptFriendQr } from '../../../hooks/useAcceptFriendQr';
import { useFriendQrPreview } from '../../../hooks/useFriendQrPreview';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import type { FriendQrPreview } from '../../../types/friend.type';
import FriendAvatar from '../components/FriendAvatar';
import FriendListMessage from '../components/FriendListMessage';
import FriendListSkeleton from '../components/FriendListSkeleton';
import FriendRequestButton from '../components/FriendRequestButton';
import {
  QR_ACCEPT_FAILURE_MESSAGE,
  QR_INVALID_MESSAGE,
  getQrScanAction,
  getQrScanError,
  parseQrToken,
  type QrScanErrorKind,
} from '../utils/friendQrScan';
import { getProfileActionAriaLabel } from '../utils/friendProfile';

const FRIEND_ADDED_MESSAGE = '친구가 됐어요';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px. 프로필 헤더와 같은 구성이다.
const PAGE_TOP_PADDING = 12;
const PAGE_BOTTOM_PADDING = 40;
const SECTION_GAP = 12;
const TITLE_GAP = 6;
const TITLE_SIZE = 18;
const DESCRIPTION_SIZE = 14;
const ROW_GAP = 16;
const AVATAR_SIZE = 48;
const TEXT_GAP = 2;
const NAME_SIZE = 16;
const SUBTITLE_SIZE = 14;

// 다시 시도해도 같은 결과인 실패. 안내만 보여 준다.
const TERMINAL_KINDS: ReadonlySet<QrScanErrorKind> = new Set([
  'invalid',
  'self',
  'not-found-user',
]);

interface FriendQrAddContentProps {
  qrToken: string | null;
  scale: number;
}

function FriendQrAddContent({ qrToken, scale }: FriendQrAddContentProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const preview = useFriendQrPreview(qrToken);
  const acceptQr = useAcceptFriendQr();
  // 친구 맺기를 누른 뒤 만료 등으로 실패하면 정상 화면 대신 그 안내를 보여 준다.
  const [blocked, setBlocked] = useState<{
    kind: QrScanErrorKind;
    message: string;
  } | null>(null);

  const goToProfile = (friendUserId: number) =>
    navigate(`/friends/${friendUserId}`, { replace: true });

  const handleBefriend = async (friend: FriendQrPreview) => {
    if (qrToken === null || acceptQr.isPending) return;

    try {
      const result = await acceptQr.mutateAsync({
        qrToken,
        friendUserId: friend.userId,
      });

      showToast(FRIEND_ADDED_MESSAGE);
      goToProfile(result.friend.userId);
    } catch (error) {
      const failure = getQrScanError(error, QR_ACCEPT_FAILURE_MESSAGE);

      if (failure.kind === 'already-friend') {
        showToast(failure.message);
        goToProfile(friend.userId);
      } else if (TERMINAL_KINDS.has(failure.kind)) {
        setBlocked(failure);
      } else {
        showToast(failure.message);
      }
    }
  };

  let content;

  if (qrToken === null) {
    content = (
      <FriendListMessage
        variant="error"
        scale={scale}
        errorMessage={QR_INVALID_MESSAGE}
      />
    );
  } else if (blocked) {
    content = (
      <FriendListMessage
        variant="error"
        scale={scale}
        errorMessage={blocked.message}
      />
    );
  } else if (preview.isPending) {
    content = <FriendListSkeleton scale={scale} count={1} />;
  } else if (preview.isError || !preview.data) {
    const failure = getQrScanError(preview.error);

    content = (
      <FriendListMessage
        variant="error"
        scale={scale}
        errorMessage={failure.message}
        onRetry={
          TERMINAL_KINDS.has(failure.kind)
            ? undefined
            : () => void preview.refetch()
        }
      />
    );
  } else {
    const friend = preview.data;
    const action = getQrScanAction(friend.relationStatus);

    content = (
      <div
        className="flex items-center justify-between"
        style={{ gap: ROW_GAP * scale }}
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
              style={{ fontSize: SUBTITLE_SIZE * scale }}
            >
              {friend.friendCode}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          {action.kind === 'befriend' ? (
            <FriendRequestButton
              variant="primary"
              scale={scale}
              disabled={acceptQr.isPending}
              aria-label={getProfileActionAriaLabel('send', friend.nickname)}
              onClick={() => void handleBefriend(friend)}
            >
              {action.label}
            </FriendRequestButton>
          ) : (
            <FriendRequestButton
              variant="neutral"
              scale={scale}
              aria-label={`${friend.nickname} 프로필 보기`}
              onClick={() => navigate(`/friends/${friend.userId}`)}
            >
              프로필 보기
            </FriendRequestButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: SECTION_GAP * scale }}>
      <div className="flex flex-col" style={{ gap: TITLE_GAP * scale }}>
        <h1
          className="font-semibold text-black"
          style={{ fontSize: TITLE_SIZE * scale, lineHeight: 'normal' }}
        >
          친구 추가
        </h1>
        <p
          className="text-gray-5"
          style={{ fontSize: DESCRIPTION_SIZE * scale, lineHeight: 'normal' }}
        >
          QR 코드로 친구를 맺어 보세요
        </p>
      </div>
      {content}
      {preview.data?.relationStatus === 'FRIEND' ? (
        <p
          role="status"
          className="text-gray-4 font-medium"
          style={{ fontSize: DESCRIPTION_SIZE * scale }}
        >
          이미 친구예요.
        </p>
      ) : null}
    </div>
  );
}

/**
 * 내 QR(MyQrDialog)을 스캔하면 열리는 친구 추가 화면. 요청·수락 없이 바로 친구가
 * 된다. 비로그인 복귀는 아직 없어서 ProtectedRoute가 로그인으로 보낸다.
 * 요청 화면, 프로필 화면과 같은 틀이고 뒤로가기 버튼은 두지 않는다(두 화면도 없음).
 */
function FriendQrAddPage({ desktop = false }: { desktop?: boolean }) {
  const mobileScale = useGlobalScale();
  const scale = desktop ? 1 : mobileScale;
  const [searchParams] = useSearchParams();
  const qrToken = parseQrToken(searchParams.get('qr'));
  // 토큰이 바뀌면 이전 토큰의 실패 상태를 들고 가지 않도록 새로 시작한다.
  const content = (
    <FriendQrAddContent key={qrToken ?? ''} qrToken={qrToken} scale={scale} />
  );

  return desktop ? (
    <DesktopPageShell>{content}</DesktopPageShell>
  ) : (
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

export default FriendQrAddPage;
