import menu from '../../assets/icons/menu.svg';

import { Logo } from '../common';

import { useGlobalScale } from '../../hooks/useGlobalScale';

const HEADER_HEIGHT = 56;
const HEADER_PADDING_X = 24;

interface HeaderProps {
  onMenuClick?: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  const scale = useGlobalScale();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#F1F1F1]"
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
        >
          <img src={menu} alt="" />
        </button>
      </div>
    </header>
  );
}

export default Header;