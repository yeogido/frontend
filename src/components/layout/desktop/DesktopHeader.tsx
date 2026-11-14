import { NavLink } from 'react-router-dom';

import { Logo } from '../../common';
import { useAuth } from '../../../hooks/useAuth';
import DesktopSearchBox from './DesktopSearchBox';
import DesktopProfileMenu from './DesktopProfileMenu';

// Figma 1440 데스크톱 시안(5725:30472) 기준 리터럴 px

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
    <header className="border-gray-2 w-full border-b bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-[16px] px-[clamp(24px,8.33vw,120px)] py-[20px]">
        <div className="flex min-w-0 items-center gap-[clamp(16px,3.33vw,48px)]">
          <div className="shrink-0">
            <Logo />
          </div>

          <nav aria-label="주요 메뉴">
            <ul className="flex items-center gap-[clamp(12px,2.78vw,40px)] whitespace-nowrap">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `text-[16px] font-medium ${
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

        <div className="flex shrink-0 items-center gap-[16px]">
          <DesktopSearchBox />

          {isAuthenticated ? (
            <DesktopProfileMenu />
          ) : (
            <NavLink
              to="/login"
              className="rounded-[12px] bg-black px-[20px] py-[12px] text-[16px] font-semibold whitespace-nowrap text-white"
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
