import close from '../../assets/icons/close.svg';
import chevronRight from '../../assets/icons/chevron-right.svg';
import { useNavigate } from 'react-router-dom';

import { guestSidebarMenu } from '../../constants/sidebarMenu';

import { Divider } from '../ui';

import { useGlobalScale } from '../../hooks/useGlobalScale';
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

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();

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
        {/* inert: 닫혀 있을 때(translate-x-full로 화면 밖) 안의 버튼들이
            여전히 DOM에 남아 있어 포커스를 받을 수 있었다 — 메뉴를 눌러
            페이지를 이동하면 그 버튼이 포커스를 계속 쥔 채로 남고, 나중에
            그 포커스가 다시 불려나오는 문제가 있었다(AuthSidebar와 동일한
            이유). 닫혀 있을 때는 inert로 포커스/상호작용 자체를 차단한다. */}
        <aside
          inert={!isOpen}
          className={`absolute top-0 right-0 flex h-full w-[72%] flex-col overflow-y-auto bg-white transition-transform duration-300 ease-in-out ${
            isOpen ? 'pointer-events-auto translate-x-0' : 'translate-x-full'
          } `}
          style={{ maxWidth: DRAWER_MAX_WIDTH * scale }}
        >
          {/* Header */}
          {/* shrink-0: 자식이 absolute뿐이라 min-height:auto가 0으로 계산돼,
              내용이 뷰포트보다 길어지면 flex-shrink로 이 영역이 찌그러들며
              아래 메뉴와 겹쳐 보인다. shrink-0로 높이를 고정하고 overflow-y-auto
              스크롤에 맡긴다. */}
          <div
            className="relative shrink-0"
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

          {/* Login */}
          <button
            type="button"
            onClick={() => {
              navigate('/login');
              onClose();
            }}
            className="flex shrink-0 items-center"
            style={{
              gap: LOGIN_GAP * scale,
              paddingLeft: LOGIN_PADDING_X * scale,
              paddingRight: LOGIN_PADDING_X * scale,
              paddingTop: LOGIN_PADDING_Y * scale,
              paddingBottom: LOGIN_PADDING_Y * scale,
            }}
          >
            <span
              className="leading-none font-semibold"
              style={{ fontSize: TEXT_BASE * scale }}
            >
              로그인
            </span>

            <img src={chevronRight} alt="" aria-hidden="true" />
          </button>

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
        </aside>
      </div>
    </div>
  );
}

export default Sidebar;
