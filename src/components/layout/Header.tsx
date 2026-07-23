import menu from '../../assets/icons/menu.svg';

import { Logo } from '../common';

import { useGlobalScale } from '../../hooks/useGlobalScale';

const HEADER_HEIGHT = 56;
const HEADER_PADDING_X = 24;

const MENU_SIZE = 24;

interface HeaderProps {
  onMenuClick?: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  const scale = useGlobalScale();

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[#F1F1F1]"
      style={{ height: HEADER_HEIGHT * scale }}
    >
      <div
        className="flex h-full items-center justify-between"
        style={{
          paddingLeft: HEADER_PADDING_X * scale,
          paddingRight: HEADER_PADDING_X * scale,
        }}
      >
        <Logo />

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="메뉴 열기"
          className="flex items-center justify-center"
          style={{
            width: MENU_SIZE * scale,
            height: MENU_SIZE * scale,
          }}
        >
          <img
            src={menu}
            alt=""
            className="h-full w-full"
          />
        </button>
      </div>
    </header>
  );
}

export default Header;