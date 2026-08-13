import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import menu from '../../assets/icons/menu.svg';
import search from '../../assets/icons/search.svg';

import { Logo } from '../common';

import { useGlobalScale } from '../../hooks/useGlobalScale';
import { APP_HEADER_HEIGHT, MIN_TOUCH_TARGET } from '../../constants/layout';

const HEADER_PADDING_X = 24;

const ICON_FRAME_SIZE = 24;
const ICON_SIZE = 17.57;
const ICON_GAP = 8;

// 히어로 이미지가 있는 화면은 맨 위에서만 헤더를 투명하게 해서 사진이
// 그대로 보이게 하고, 스크롤하면 원래처럼 채워진 헤더로 돌아온다.
const TRANSPARENT_HEADER_PATHS = ['/local-course'];
// 모바일 브라우저(특히 주소창이 접히고 펼쳐질 때)나 트랙패드 탄성
// 스크롤은 실제로 스크롤하지 않았는데도 scrollY가 0이 아닌 아주 작은
// 값(1~수 px)으로 잠깐 찍힐 때가 있다 — 정확히 0으로만 비교하면 화면
// 맨 위인데도 헤더가 채워진 것처럼 보이는 오탐이 생겨 약간의 여유를 둔다.
const TOP_SCROLL_THRESHOLD = 4;

interface HeaderProps {
  onMenuClick?: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  const scale = useGlobalScale();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isProfilePage = pathname === '/profile';
  const isTransparentHeaderPage = TRANSPARENT_HEADER_PATHS.includes(pathname);

  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    if (!isTransparentHeaderPage) {
      return;
    }

    const handleScroll = () =>
      setIsAtTop(window.scrollY <= TOP_SCROLL_THRESHOLD);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransparentHeaderPage]);

  const isTransparent = isTransparentHeaderPage && isAtTop;
  // 사진 위에서는 검색/메뉴 아이콘이 원래 색(어두운 회색)으로는 배경에
  // 묻혀 안 보일 수 있어(특히 짙은 초록 배경), 흰색 + 그림자로 바꿔
  // 어떤 사진 위에서도 보이게 한다.
  const transparentIconClassName = isTransparent
    ? '[filter:brightness(0)_invert(1)_drop-shadow(0_1px_3px_rgba(0,0,0,0.5))]'
    : '';

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
    navigate('/course-region-search?from=home');
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 ${
        isTransparent ? 'bg-transparent' : 'bg-[#F1F1F1]'
      }`}
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
              display: isProfilePage ? 'none' : undefined,
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
                className={`transition-[filter] duration-200 ${transparentIconClassName}`}
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
                className={`transition-[filter] duration-200 ${transparentIconClassName}`}
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
