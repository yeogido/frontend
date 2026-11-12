import qrCodeIcon from '../../../assets/icons/qr-code-rounded.svg';
import FriendAvatar from './FriendAvatar';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px. scale은 useGlobalScale 값이다.
const AVATAR_SIZE = 120;
const QR_BUTTON_SIZE = 32;
const QR_BUTTON_INSET = 4;
const QR_ICON_SIZE = 20;

interface ProfileAvatarWithQrProps {
  userId: number | null;
  name: string;
  profileImageUrl?: string | null;
  scale: number;
  /** 없으면 QR 버튼을 그리지 않는다. */
  onShowQr?: () => void;
}

/**
 * 프로필 화면의 아바타. 사진이 있으면 사진, 없거나 불러오지 못하면 이름 글자
 * 아바타를 보여 주고, 오른쪽 아래 모서리에 내 QR을 여는 버튼을 겹친다.
 * 사진 변경은 프로필 수정 화면에서만 한다.
 */
function ProfileAvatarWithQr({
  userId,
  name,
  profileImageUrl = null,
  scale,
  onShowQr,
}: ProfileAvatarWithQrProps) {
  return (
    <div className="relative">
      <FriendAvatar
        userId={userId ?? 0}
        nickname={name}
        profileImageUrl={profileImageUrl}
        size={AVATAR_SIZE * scale}
      />
      {onShowQr ? (
        <button
          type="button"
          aria-label="내 QR 코드 보기"
          onClick={onShowQr}
          className="absolute flex items-center justify-center rounded-full bg-[#f9f9f9]/80 before:absolute before:-inset-2 before:content-['']"
          style={{
            right: QR_BUTTON_INSET * scale,
            bottom: QR_BUTTON_INSET * scale,
            width: QR_BUTTON_SIZE * scale,
            height: QR_BUTTON_SIZE * scale,
          }}
        >
          <img
            src={qrCodeIcon}
            alt=""
            aria-hidden="true"
            style={{
              width: QR_ICON_SIZE * scale,
              height: QR_ICON_SIZE * scale,
            }}
          />
        </button>
      ) : null}
    </div>
  );
}

export default ProfileAvatarWithQr;
