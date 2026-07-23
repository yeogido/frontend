import close from '../../assets/icons/close.svg';
import chevronRight from '../../assets/icons/chevron-right.svg';
import { useNavigate } from 'react-router-dom';

import { guestSidebarMenu } from '../../constants/sidebarMenu';

import { Divider } from '../ui';

import { useGlobalScale } from '../../hooks/useGlobalScale';

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
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`
          absolute inset-0 z-[60]
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
          absolute top-0 right-0 z-[70]
          flex h-full w-[72%] flex-col
          overflow-y-auto
          bg-white
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ maxWidth: DRAWER_MAX_WIDTH * scale }}
      >
        {/* Header */}
        <div className="relative" style={{ height: DRAWER_HEADER_HEIGHT * scale }}>
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
      </aside>
    </>
  );
}

export default Sidebar;