import type { ReactNode } from 'react';
import { MdCake, MdLocationOn } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

import DesktopOwnAvatar from '../../../components/layout/desktop/DesktopOwnAvatar';
import DesktopPageShell from '../../../components/layout/desktop/DesktopPageShell';
import { useMyProfile } from '../../../hooks/useMyProfile';

// Figma 1440 데스크톱 시안(5745:34604, 5745:35885) 기준 리터럴 px.
const AVATAR_SIZE = 100;

const TABS = [
  { key: 'likes', label: '좋아요', to: '/likes' },
  { key: 'posts', label: '등록한 게시물', to: '/my-posts' },
] as const;

export type MyActivityTab = (typeof TABS)[number]['key'];

interface MyActivityShellProps {
  readonly activeTab: MyActivityTab;
  readonly children: ReactNode;
}

/**
 * 내 활동 화면(좋아요·등록한 게시물)의 공통 뼈대 — 프로필 요약, 탭, 본문.
 * 탭은 각각 별도 라우트라서 링크로 이동한다.
 */
function MyActivityShell({ activeTab, children }: MyActivityShellProps) {
  const navigate = useNavigate();
  const { data: profile } = useMyProfile();

  return (
    <DesktopPageShell>
      <div className="flex flex-col gap-[32px]">
        <section
          aria-label="프로필"
          className="flex items-start justify-between"
        >
          <div className="flex items-center gap-[32px]">
            <DesktopOwnAvatar
              src={profile?.profileImageUrl}
              name={profile?.name ?? '회원'}
              size={AVATAR_SIZE}
            />

            <div className="flex flex-col gap-[12px]">
              <div className="flex flex-col gap-[4px]">
                <h1 className="text-[24px] font-semibold text-black">
                  {profile?.name}
                </h1>
                <p className="text-gray-4 text-[16px]">{profile?.email}</p>
              </div>

              <div className="text-gray-4 flex items-center gap-[12px] text-[16px]">
                {profile?.region ? (
                  <span className="flex items-center gap-[4px]">
                    <MdLocationOn aria-hidden="true" className="text-[20px]" />
                    {profile.region}
                  </span>
                ) : null}
                {profile?.birthYear ? (
                  <span className="flex items-center gap-[6px]">
                    <MdCake aria-hidden="true" className="text-[20px]" />
                    {profile.birthYear}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/profile/edit')}
            className="bg-main-2 text-main-4 rounded-[8px] px-[12px] py-[10px] text-[16px] font-semibold"
          >
            프로필 편집
          </button>
        </section>

        <div className="flex flex-col gap-[24px]">
          <nav aria-label="내 활동" className="border-gray-2 flex border-b">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <Link
                  key={tab.key}
                  to={tab.to}
                  replace
                  aria-current={isActive ? 'page' : undefined}
                  className={`-mb-px px-[40px] py-[12px] text-[16px] ${
                    isActive
                      ? 'border-b-2 border-black font-semibold text-black'
                      : 'text-gray-3 border-b-2 border-transparent font-medium'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {children}
        </div>
      </div>
    </DesktopPageShell>
  );
}

export default MyActivityShell;
