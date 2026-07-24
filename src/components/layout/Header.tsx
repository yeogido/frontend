import { useNavigate } from 'react-router-dom';

import menu from '../../assets/icons/menu.svg';
import search from '../../assets/icons/search.svg';

import { Logo } from '../common';

import { useGlobalScale } from '../../hooks/useGlobalScale';

const HEADER_HEIGHT = 56;
const HEADER_PADDING_X = 24;

const ICON_FRAME_SIZE = 24;
const ICON_SIZE = 17.57;
const ICON_GAP = 8;

interface HeaderProps {
  onMenuClick?: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  const scale = useGlobalScale();
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate('/course-region-search?from=course');
  };

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

        <div
          className="flex items-center"
          style={{
            gap: ICON_GAP * scale,
          }}
        >
          <button
            type="button"
            onClick={handleSearchClick}
            aria-label="검색"
            className="flex items-center justify-center"
            style={{
              width: ICON_FRAME_SIZE * scale,
              height: ICON_FRAME_SIZE * scale,
            }}
          >
            <img
              src={search}
              alt=""
              style={{
                width: ICON_SIZE * scale,
                height: ICON_SIZE * scale,
              }}
            />
          </button>

          <button
            type="button"
            onClick={onMenuClick}
            aria-label="메뉴 열기"
            className="flex items-center justify-center"
            style={{
              width: ICON_FRAME_SIZE * scale,
              height: ICON_FRAME_SIZE * scale,
            }}
          >
            <img
              src={menu}
              alt=""
              style={{
                width: ICON_SIZE * scale,
                height: ICON_SIZE * scale,
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;