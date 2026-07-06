import menu from '../../assets/icons/menu.svg';

import { Logo } from '../common';

interface HeaderProps {
  onMenuClick?: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white">
      <div className="flex h-full items-center justify-between px-6">
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