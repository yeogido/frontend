import { NavLink, useNavigate } from 'react-router-dom';

import searchIcon from '../../../assets/icons/search.svg';
import { Logo } from '../../common';
import ProfileAvatar from '../../common/ProfileAvatar';
import { useAuth } from '../../../hooks/useAuth';
import { useMyProfile } from '../../../hooks/useMyProfile';

// Figma 1440 데스크톱 시안(5725:30472) 기준 리터럴 px
const AVATAR_SIZE = 45;

const NAV_ITEMS = [
  { label: '여기도 추천 코스', to: '/yeogido-course' },
  { label: '여기도 추천 행사', to: '/festival' },
  { label: '우리동네 추천 코스', to: '/local-course' },
  { label: '지역 소상공인', to: '/local-business' },
] as const;

/**
 * 데스크톱 전용 상단 헤더. 모바일 Header(로고 + 검색/메뉴 아이콘)와 달리
 * 네비게이션을 펼쳐서 보여준다. 검색은 기존 검색 화면으로 넘기고, 여기서
 * 입력받지는 않는다 — 시안의 검색창도 진입점이다.
 */
function DesktopHeader() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: profile } = useMyProfile();

  return (
    <header className="border-gray-2 w-full border-b bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-[120px] py-[20px]">
        <div className="flex items-center gap-[48px]">
          <Logo />

          <nav aria-label="주요 메뉴">
            <ul className="flex items-center gap-[40px]">
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

        <div className="flex items-center gap-[24px]">
          <button
            type="button"
            onClick={() => navigate('/course-region-search?from=home')}
            className="border-gray-2 flex w-[282px] items-center justify-between rounded-full border bg-white px-[16px] py-[10px]"
          >
            <span className="text-gray-4 text-[14px]">
              검색어를 입력해 주세요
            </span>
            <img src={searchIcon} alt="" className="size-[18px]" />
          </button>

          {isAuthenticated ? (
            <NavLink to="/profile" aria-label="내 프로필">
              <ProfileAvatar
                src={profile?.profileImageUrl}
                size={AVATAR_SIZE}
              />
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className="text-gray-5 text-[16px] font-medium whitespace-nowrap"
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
