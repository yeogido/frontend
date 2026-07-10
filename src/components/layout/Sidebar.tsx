import close from '../../assets/icons/close.svg';
import chevronRight from '../../assets/icons/chevron-right.svg';

import { guestSidebarMenu } from '../../constants/sidebarMenu';

import { Divider } from '../ui';

import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {

  const navigate = useNavigate();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-[60]
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
          fixed top-0 right-0 z-[70]
          flex h-full w-[72%] max-w-[280px] flex-col
          overflow-y-auto
          bg-white
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="relative h-[67px]">
          <button
            type="button"
            onClick={onClose}
            aria-label="사이드바 닫기"
            className="absolute right-6 top-5"
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
          className="flex items-center gap-[6px] px-6 py-4"
        >
          <span className="text-base font-semibold leading-none">
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
              className="flex h-[51px] items-center justify-between px-6 text-left"
            >
              <span className="text-base font-medium leading-none">
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