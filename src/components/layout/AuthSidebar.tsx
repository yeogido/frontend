import close from '../../assets/icons/close.svg';
import logout from '../../assets/icons/out.svg';
import { useNavigate } from 'react-router-dom';

import { guestSidebarMenu } from '../../constants/sidebarMenu';

import { Divider } from '../ui';

import { useAuth } from '../../hooks/useAuth';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useLogout } from '../../hooks/useLogout';
import { APP_MAX_WIDTH } from '../../constants/layout';

const DRAWER_MAX_WIDTH = 280;
const DRAWER_HEADER_HEIGHT = 111;
const CLOSE_TOP = 20;
const CLOSE_RIGHT = 24;
const PROFILE_TOP = 59;
const PROFILE_LEFT = 24;
const AVATAR_SIZE = 40;
const PROFILE_GAP = 12;
const NAME_TEXT_SIZE = 16;
const MENU_ITEM_HEIGHT = 51;
const MENU_PADDING_X = 24;
const TEXT_BASE = 16;
const MY_LABEL_SIZE = 13;
const MY_LABEL_PADDING_TOP = 16;
const MY_LABEL_PADDING_BOTTOM = 4;
const LOGOUT_PADDING_Y = 16;
const LOGOUT_ICON_SIZE = 20;
const LOGOUT_GAP = 12;

/**
 * 로그인 전용 메뉴. path가 없는 항목은 아직 연결된 화면이 없어
 * 클릭 시 사이드바만 닫는다. 화면이 만들어지면 path를 채워 넣는다.
 */
const MY_MENU: { label: string; path?: string }[] = [
  { label: '여행기록', path: '/travel-record' },
  { label: '좋아요', path: '/likes' },
  { label: '내가 등록한 게시물', path: '/my-posts' },
];

interface AuthSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function AuthSidebar({ isOpen, onClose }: AuthSidebarProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const handleLogout = useLogout();
  const { userId } = useAuth();
  // 닉네임/이메일을 내려주는 사용자 프로필 API가 아직 없어, 지어낸 값 대신
  // 실제로 존재하는 userId 기반의 안전한 표시값만 사용한다.
  const displayName = userId ? `회원 #${userId}` : '회원';

  return (
    // 뷰포트 고정 레이어: 스크롤 위치와 무관하게 항상 현재 화면을 덮는다.
    // 이 레이어 자체는 뷰포트 전체 폭(fixed inset-0)이므로 여기에
    // overflow-x-hidden을 걸어도 소용없다 — 실제로 잘라야 할 경계는
    // 안쪽 500px 컬럼이다.
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? '' : 'pointer-events-none'}`}
    >
      {/* App.tsx의 500px 중앙 정렬 컬럼과 동일한 폭/정렬을 재현.
          overflow-x-hidden을 반드시 이 500px 컬럼에 걸어야, 드로어가
          translate-x-full로 컬럼 밖으로 나갔을 때 실제로 잘려서 안 보인다. */}
      <div
        className="relative mx-auto h-full w-full overflow-x-hidden"
        style={{ maxWidth: APP_MAX_WIDTH }}
      >
        {/* Overlay */}
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isOpen
              ? 'visible opacity-100'
              : 'pointer-events-none invisible opacity-0'
          } `}
        />

        {/* Drawer */}
        <aside
          className={`absolute top-0 right-0 flex h-full w-[72%] flex-col overflow-y-auto bg-white transition-transform duration-300 ease-in-out ${
            isOpen ? 'pointer-events-auto translate-x-0' : 'translate-x-full'
          } `}
          style={{ maxWidth: DRAWER_MAX_WIDTH * scale }}
        >
          {/* Header: 프로필 요약 + 닫기 버튼 */}
          {/* shrink-0: 내용이 뷰포트보다 길어지면 overflow-y-auto로
              스크롤되어야 하는데, flex 자식은 기본적으로 shrink 가능해서
              (특히 이 div는 자식이 전부 absolute라 min-height:auto가 0으로
              계산됨) 공간이 부족하면 찌그러들며 프로필이 메뉴와 겹쳐
              보였다. shrink-0로 항상 지정한 높이를 유지하고 스크롤에 맡긴다. */}
          <div
            className="relative shrink-0"
            style={{ height: DRAWER_HEADER_HEIGHT * scale }}
          >
            <div
              className="absolute flex min-w-0 items-center"
              style={{
                top: PROFILE_TOP * scale,
                left: PROFILE_LEFT * scale,
                gap: PROFILE_GAP * scale,
              }}
            >
              <div
                className="shrink-0 rounded-full bg-[#E4E4E4]"
                style={{
                  width: AVATAR_SIZE * scale,
                  height: AVATAR_SIZE * scale,
                }}
              />

              <div className="flex min-w-0 flex-col">
                <span
                  className="truncate leading-none font-semibold text-[#1C1C1C]"
                  style={{ fontSize: NAME_TEXT_SIZE * scale }}
                >
                  {displayName}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="사이드바 닫기"
              className="absolute"
              style={{ right: CLOSE_RIGHT * scale, top: CLOSE_TOP * scale }}
            >
              <img src={close} alt="닫기" />
            </button>
          </div>

          <Divider />

          {/* Menu */}
          <nav className="flex shrink-0 flex-col">
            {guestSidebarMenu.map((menu) => (
              <button
                key={menu.path}
                type="button"
                onClick={() => {
                  navigate(menu.path);
                  onClose();
                }}
                className="flex items-center justify-between text-left"
                style={{
                  height: MENU_ITEM_HEIGHT * scale,
                  paddingLeft: MENU_PADDING_X * scale,
                  paddingRight: MENU_PADDING_X * scale,
                }}
              >
                <span
                  className="leading-none font-medium"
                  style={{ fontSize: TEXT_BASE * scale }}
                >
                  {menu.label}
                </span>
              </button>
            ))}
          </nav>

          <Divider />

          {/* MY: 마이페이지 메뉴 */}
          <div
            className="shrink-0"
            style={{
              paddingLeft: MENU_PADDING_X * scale,
              paddingTop: MY_LABEL_PADDING_TOP * scale,
              paddingBottom: MY_LABEL_PADDING_BOTTOM * scale,
            }}
          >
            <span
              className="leading-none font-semibold text-[#FF6F41]"
              style={{ fontSize: MY_LABEL_SIZE * scale }}
            >
              MY
            </span>
          </div>

          <nav className="flex shrink-0 flex-col">
            {MY_MENU.map((menu) => (
              <button
                key={menu.label}
                type="button"
                onClick={() => {
                  if (menu.path) {
                    navigate(menu.path);
                  }
                  onClose();
                }}
                className="flex items-center justify-between text-left"
                style={{
                  height: MENU_ITEM_HEIGHT * scale,
                  paddingLeft: MENU_PADDING_X * scale,
                  paddingRight: MENU_PADDING_X * scale,
                }}
              >
                <span
                  className="leading-none font-medium"
                  style={{ fontSize: TEXT_BASE * scale }}
                >
                  {menu.label}
                </span>
              </button>
            ))}
          </nav>

          {/* 로그아웃: 메뉴가 짧아도 항상 사이드바 하단에 붙도록 mt-auto로 민다 */}
          <div className="mt-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                void handleLogout();
                onClose();
              }}
              className="flex items-center text-left"
              style={{
                gap: LOGOUT_GAP * scale,
                paddingLeft: MENU_PADDING_X * scale,
                paddingRight: MENU_PADDING_X * scale,
                paddingTop: LOGOUT_PADDING_Y * scale,
                paddingBottom: LOGOUT_PADDING_Y * scale,
              }}
            >
              <img
                src={logout}
                alt=""
                aria-hidden="true"
                style={{
                  width: LOGOUT_ICON_SIZE * scale,
                  height: LOGOUT_ICON_SIZE * scale,
                }}
              />
              <span
                className="leading-none font-medium text-[#1C1C1C]"
                style={{ fontSize: TEXT_BASE * scale }}
              >
                로그아웃
              </span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AuthSidebar;
