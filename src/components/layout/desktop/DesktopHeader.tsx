import { NavLink } from 'react-router-dom';

import { Logo } from '../../common';
import { ScaleContext } from '../../../contexts/ScaleContext';
import { useAuth } from '../../../hooks/useAuth';
import DesktopSearchBox from './DesktopSearchBox';
import DesktopProfileMenu from './DesktopProfileMenu';

// Figma 1440 데스크톱 시안(5725:30472) 기준 리터럴 px

// 로고 원본은 40px 높이(너비 123) — 시안은 48px이라 1.2배. transform은 레이아웃
// 크기를 바꾸지 않으므로 래퍼에 시안 크기(148×48)를 직접 줘서 헤더 높이 89를 맞춘다.
const LOGO_SCALE = 1.2;
const LOGO_WIDTH = 148;
const LOGO_HEIGHT = 48;

const NAV_ITEMS = [
  { label: '여기도 추천 코스', to: '/yeogido-course' },
  { label: '여기도 추천 행사', to: '/festival' },
  { label: '우리동네 추천 코스', to: '/local-course' },
  { label: '지역 소상공인', to: '/local-business' },
] as const;

/**
 * 데스크톱 전용 상단 헤더. 모바일 Header(로고 + 검색/메뉴 아이콘)와 달리
 * 네비게이션을 펼쳐서 보여주고, 검색창은 입력과 지역 선택 패널을 직접 가진다.
 */
function DesktopHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="border-gray-2 sticky top-0 z-50 w-full border-b bg-[#f9f9f9]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-[16px] px-[clamp(24px,8.33vw,120px)] py-[20px]">
        <div className="flex min-w-0 items-center gap-[clamp(16px,3.33vw,48px)]">
          <div
            className="flex shrink-0 items-center"
            style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT }}
          >
            <ScaleContext.Provider value={LOGO_SCALE}>
              <Logo />
            </ScaleContext.Provider>
          </div>

          <nav aria-label="주요 메뉴">
            <ul className="flex items-center gap-[clamp(12px,2.78vw,40px)] whitespace-nowrap">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `text-[16px] font-bold ${
                        isActive ? 'text-main-5' : 'text-gray-5'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-[24px]">
          <DesktopSearchBox />

          {isAuthenticated ? (
            <DesktopProfileMenu />
          ) : (
            <NavLink
              to="/login"
              className="rounded-[12px] bg-[#1c1c1c] px-[16px] py-[12px] text-[18px] font-semibold whitespace-nowrap text-[#f9f9f9]"
            >
              로그인
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default DesktopHeader;
