import close from '../../assets/icons/close.svg';
import chevronRight from '../../assets/icons/chevron-right.svg';
import { useNavigate } from 'react-router-dom';

import { guestSidebarMenu } from '../../constants/sidebarMenu';

import { Divider } from '../ui';

import { useAuth } from '../../hooks/useAuth';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useLogout } from '../../hooks/useLogout';
import { APP_MAX_WIDTH } from '../../constants/layout';

const DRAWER_MAX_WIDTH = 280;
const DRAWER_HEADER_HEIGHT = 67;
const CLOSE_TOP = 20;
const CLOSE_RIGHT = 24;
const LOGIN_GAP = 6;
const LOGIN_PADDING_X = 24;
const LOGIN_PADDING_Y = 16;
const TEXT_BASE = 16;
const MENU_ITEM_HEIGHT = 51;
const MENU_PADDING_X = 24;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 로그인/권한 기능 구현 전까지, 테스트 및 화면 확인용으로 임시 노출하는 메뉴.
 * 실제 접근 권한과 메뉴 노출 조건이 구현되면 이 블록은 제거하거나
 * 조건부 렌더링으로 교체 예정.
 */
const TEMP_MENU = [
  { path: '/travel-record', label: '여행기록 (임시)' },
  { path: '/admin', label: '관리자 페이지 (임시)' },
];

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { isAuthenticated } = useAuth();
  const handleLogout = useLogout();

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
          className={`
            absolute inset-0
            bg-black/40
            transition-opacity duration-300
            ${
              isOpen
                ? 'visible opacity-100'
                : 'invisible pointer-events-none opacity-0'
            }
          `}
        />

        {/* Drawer */}
        <aside
          className={`
            absolute top-0 right-0
            flex h-full w-[72%] flex-col
            overflow-y-auto
            bg-white
            transition-transform duration-300 ease-in-out
            ${
              isOpen
                ? 'translate-x-0 pointer-events-auto'
                : 'translate-x-full'
            }
          `}
          style={{ maxWidth: DRAWER_MAX_WIDTH * scale }}
        >
          {/* Header */}
          <div
            className="relative"
            style={{ height: DRAWER_HEADER_HEIGHT * scale }}
          >
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

          {/* Login / Logout */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                void handleLogout();
                onClose();
              }}
              style={{
                paddingLeft: LOGIN_PADDING_X * scale,
                paddingRight: LOGIN_PADDING_X * scale,
                paddingTop: LOGIN_PADDING_Y * scale,
                paddingBottom: LOGIN_PADDING_Y * scale,
              }}
            >
              <span
                className="font-semibold leading-none"
                style={{ fontSize: TEXT_BASE * scale }}
              >
                로그아웃
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                navigate('/login');
                onClose();
              }}
              className="flex items-center"
              style={{
                gap: LOGIN_GAP * scale,
                paddingLeft: LOGIN_PADDING_X * scale,
                paddingRight: LOGIN_PADDING_X * scale,
                paddingTop: LOGIN_PADDING_Y * scale,
                paddingBottom: LOGIN_PADDING_Y * scale,
              }}
            >
              <span
                className="font-semibold leading-none"
                style={{ fontSize: TEXT_BASE * scale }}
              >
                로그인
              </span>

              <img
                src={chevronRight}
                alt=""
                aria-hidden="true"
              />
            </button>
          )}

          <Divider />

          {/* Menu */}
          <nav className="flex flex-col">
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
                  className="font-medium leading-none"
                  style={{ fontSize: TEXT_BASE * scale }}
                >
                  {menu.label}
                </span>
              </button>
            ))}
          </nav>

          <Divider />

          {/* 임시 메뉴: 로그인/권한 기능 구현 전까지 테스트용으로 노출 */}
          <nav className="flex flex-col">
            {TEMP_MENU.map((menu) => (
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
                  className="font-medium leading-none text-[#FF6F41]"
                  style={{ fontSize: TEXT_BASE * scale }}
                >
                  {menu.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}

export default Sidebar;