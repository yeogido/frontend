import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import DesktopOwnAvatar from './DesktopOwnAvatar';
import { useAuth } from '../../../hooks/useAuth';
import { useLogout } from '../../../hooks/useLogout';
import { useMyProfile } from '../../../hooks/useMyProfile';
import { useTravelRecordSessionStore } from '../../../store/travelRecordSession.store';
import MyQrDialog from '../../../pages/friends/components/MyQrDialog';

/** Figma 6456:24456 — 상단 프로필 메뉴와 QR 진입점. */
function DesktopProfileMenu() {
  const { userId } = useAuth();
  const { data: profile } = useMyProfile();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const name = profile?.name ?? (userId ? `회원 #${userId}` : '회원');

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="내 메뉴"
        aria-expanded={open}
        aria-controls="desktop-profile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <DesktopOwnAvatar
          src={profile?.profileImageUrl}
          name={name}
          size={45}
        />
      </button>
      {open ? (
        <div
          id="desktop-profile-menu"
          className="border-gray-2 absolute top-[52px] right-0 z-40 flex w-[264px] flex-col gap-[20px] rounded-[12px] border bg-white px-[24px] py-[20px] shadow-sm"
        >
          <div className="flex items-center gap-[8px]">
            <DesktopOwnAvatar
              src={profile?.profileImageUrl}
              name={name}
              size={40}
            />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{name}</p>
              <p className="text-gray-4 truncate text-[12px]">
                {profile?.email}
              </p>
            </div>
          </div>
          <Link
            to="/travel-record"
            onClick={() => {
              useTravelRecordSessionStore.getState().setListView('folder');
              setOpen(false);
            }}
            className="bg-main-5 rounded-[6px] px-[10px] py-[8px] text-center text-[14px] font-semibold text-white"
          >
            여행 기록
          </Link>
          <nav
            aria-label="내 메뉴"
            className="border-gray-2 flex flex-col gap-[20px] border-y py-[20px] text-[14px]"
          >
            <Link to="/likes" onClick={() => setOpen(false)}>
              내 프로필
            </Link>
            <button
              type="button"
              className="text-left"
              disabled={!userId}
              onClick={() => {
                setOpen(false);
                setQrOpen(true);
              }}
            >
              큐알 보기
            </button>
            <Link to="/friends" onClick={() => setOpen(false)}>
              친구 목록
            </Link>
            <Link to="/account" onClick={() => setOpen(false)}>
              계정 관리
            </Link>
            <button
              type="button"
              disabled
              title="준비 중인 기능"
              className="text-gray-3 text-left"
            >
              최근 본 게시물
            </button>
          </nav>
          <button
            type="button"
            className="text-left text-[14px] text-[#c41010]"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            로그아웃
          </button>
        </div>
      ) : null}
      {qrOpen && userId ? (
        <MyQrDialog
          userId={userId}
          name={name}
          profileImageUrl={profile?.profileImageUrl}
          scale={1}
          onClose={() => {
            setQrOpen(false);
            triggerRef.current?.focus();
          }}
        />
      ) : null}
    </div>
  );
}

export default DesktopProfileMenu;
