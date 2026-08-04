import { useNavigate } from 'react-router-dom';

import menu from '../../assets/icons/menu.svg';
import search from '../../assets/icons/search.svg';

import { Logo } from '../common';

import { useGlobalScale } from '../../hooks/useGlobalScale';
import { APP_HEADER_HEIGHT, MIN_TOUCH_TARGET } from '../../constants/layout';

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

  const iconFrameSize = Math.max(ICON_FRAME_SIZE, ICON_FRAME_SIZE * scale);
  const iconGap = ICON_GAP * scale;
  // The 390px visual frames stay 24px wide. Because their centers are closer
  // than 44px, shift the actual button boxes outward until their edges meet,
  // then counter-shift the SVGs to keep both visual centers unchanged.
  const hitTargetOffset = Math.max(
    (MIN_TOUCH_TARGET - (iconFrameSize + iconGap)) / 2,
    0
  );

  const handleSearchClick = () => {
    navigate('/course-region-search?from=course');
  };

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[#F1F1F1]"
      style={{ height: APP_HEADER_HEIGHT * scale }}
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
            gap: iconGap,
          }}
        >
          <div
            className="relative shrink-0"
            style={{
              width: iconFrameSize,
              height: iconFrameSize,
            }}
          >
            <button
              type="button"
              onClick={handleSearchClick}
              aria-label="검색"
              className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{
                width: MIN_TOUCH_TARGET,
                height: MIN_TOUCH_TARGET,
                marginLeft: -hitTargetOffset,
              }}
            >
              <img
                src={search}
                alt=""
                style={{
                  width: ICON_SIZE * scale,
                  height: ICON_SIZE * scale,
                  transform: `translateX(${hitTargetOffset}px)`,
                }}
              />
            </button>
          </div>

          <div
            className="relative shrink-0"
            style={{
              width: iconFrameSize,
              height: iconFrameSize,
            }}
          >
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="메뉴 열기"
              className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{
                width: MIN_TOUCH_TARGET,
                height: MIN_TOUCH_TARGET,
                marginLeft: hitTargetOffset,
              }}
            >
              <img
                src={menu}
                alt=""
                style={{
                  width: ICON_SIZE * scale,
                  height: ICON_SIZE * scale,
                  transform: `translateX(${-hitTargetOffset}px)`,
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
