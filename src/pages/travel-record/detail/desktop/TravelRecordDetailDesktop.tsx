import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import uploadIcon from '../../../../assets/icons/travel-detail-upload-desktop.svg';
import moreIcon from '../../../../assets/icons/travel-detail-more-desktop.svg';
import DesktopPageShell from '../../../../components/layout/desktop/DesktopPageShell';
import { getFriendAvatarColor } from '../../../friends/utils/friendAvatarColor';
import { TravelFolderArtwork } from '../../components';
import type { TravelRecordFolder } from '../../types';
import TravelRecordMembers from '../components/TravelRecordMembers';
import TravelRecordShareModal from '../components/TravelRecordShareModal';

interface Props {
  folder: TravelRecordFolder;
  inviteFolder?: TravelRecordFolder;
  profileName: string;
  profileImageUrl?: string | null;
  menuRef: RefObject<HTMLDivElement | null>;
  menuOpen: boolean;
  setMenuOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  shareOpen: boolean;
  setShareOpen: (open: boolean) => void;
  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  isPending: boolean;
  isDeleting: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canChangeVisibility: boolean;
  visibilityTargetLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  onVisibilityChange: () => void;
}

function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isOpen = selected !== null;
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
      if (event.key === 'Tab') {
        const buttons = Array.from(
          dialogRef.current?.querySelectorAll<HTMLButtonElement>(
            'button:not([disabled])'
          ) ?? []
        );
        const first = buttons[0];
        const last = buttons.at(-1);
        if (
          first &&
          last &&
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          first &&
          last &&
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === 'ArrowRight')
        setSelected((i) =>
          i === null ? null : Math.min(i + 1, photos.length - 1)
        );
      if (event.key === 'ArrowLeft')
        setSelected((i) => (i === null ? null : Math.max(i - 1, 0)));
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, photos.length]);
  useEffect(() => {
    if (selected === null && triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [selected]);
  if (photos.length === 0)
    return (
      <p className="text-gray-4 py-[80px] text-center">
        등록된 여행 사진이 없어요.
      </p>
    );
  return (
    <>
      <section
        aria-label={`${title} 여행 사진`}
        className="grid grid-cols-4 gap-x-[16px] gap-y-[14px]"
      >
        {photos.map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            aria-label={`${title} 여행 사진 ${index + 1} 보기`}
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setSelected(index);
            }}
            className={`bg-gray-2 overflow-hidden rounded-[24px] ${index === 0 ? 'col-span-2 row-span-2 aspect-[514/688]' : 'aspect-[249/337]'}`}
          >
            <img src={photo} alt="" className="size-full object-cover" />
          </button>
        ))}
      </section>
      {selected !== null && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={dialogRef}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
              role="dialog"
              aria-modal="true"
              aria-label={`${title} 여행 사진 보기`}
            >
              <button
                ref={closeRef}
                type="button"
                aria-label="사진 닫기"
                onClick={() => setSelected(null)}
                className="absolute top-6 right-6 text-[32px] text-white"
              >
                ×
              </button>
              <button
                type="button"
                aria-label="이전 사진"
                disabled={selected === 0}
                onClick={() =>
                  setSelected((i) => (i === null ? null : Math.max(i - 1, 0)))
                }
                className="px-4 text-[36px] text-white disabled:opacity-30"
              >
                ‹
              </button>
              <img
                src={photos[selected]}
                alt={`${title} 여행 사진 ${selected + 1}`}
                className="max-h-[80vh] max-w-[80vw] min-w-0 object-contain"
              />
              <button
                type="button"
                aria-label="다음 사진"
                disabled={selected === photos.length - 1}
                onClick={() =>
                  setSelected((i) =>
                    i === null ? null : Math.min(i + 1, photos.length - 1)
                  )
                }
                className="px-4 text-[36px] text-white disabled:opacity-30"
              >
                ›
              </button>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

/** Figma 6336:72895, 6336:72960. 서버 데이터로 폴더와 사진을 그린다. */
function TravelRecordDetailDesktop({
  folder,
  inviteFolder,
  profileName,
  profileImageUrl,
  menuRef,
  menuOpen,
  setMenuOpen,
  shareOpen,
  setShareOpen,
  deleteOpen,
  setDeleteOpen,
  isPending,
  isDeleting,
  canEdit,
  canDelete,
  canChangeVisibility,
  visibilityTargetLabel,
  onEdit,
  onDelete,
  onVisibilityChange,
}: Props) {
  const photos = folder.photos.filter(Boolean);
  const members = [
    ...(folder.owner ? [folder.owner] : []),
    ...(folder.participants ?? []).filter(
      (member) => member.userId !== folder.owner?.userId
    ),
  ].map((member) => ({
    id: String(member.userId),
    name: member.nickname,
    color: getFriendAvatarColor(member.userId),
  }));
  return (
    <DesktopPageShell contentWidth={1048}>
      <header className="relative flex items-start justify-between gap-6">
        <div className="flex min-w-0 items-center gap-[40px]">
          <div className="h-[254px] w-[221px] shrink-0">
            <div style={{ zoom: 221 / 159 }}>
              <TravelFolderArtwork
                photos={photos}
                title={folder.title}
                decorations={folder.decorations}
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-col items-start gap-[8px]">
            <h1 className="text-[32px] leading-normal font-medium break-words text-black">
              {folder.title}
            </h1>
            <time className="bg-gray-2 text-gray-4 rounded-full px-[12px] py-[6px] text-[24px]">
              {folder.period}
            </time>
            {folder.visibility === 'friends' && members.length > 0 ? (
              <div className="mt-[16px]">
                <TravelRecordMembers members={members} desktop />
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-[16px]">
          <button
            type="button"
            aria-label="여행 폴더 공유하기"
            disabled={!inviteFolder || isPending}
            onClick={() => {
              setMenuOpen(false);
              setShareOpen(true);
            }}
            className="flex size-8 items-center justify-center disabled:opacity-50"
          >
            <img src={uploadIcon} alt="" width={32} height={32} />
          </button>
          {canEdit || canDelete || canChangeVisibility ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-label="여행 기록 메뉴"
                aria-controls="travel-record-action-menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="flex size-8 items-center justify-center"
              >
                <img src={moreIcon} alt="" />
              </button>
              {menuOpen ? (
                <div
                  id="travel-record-action-menu"
                  role="menu"
                  aria-label="여행 기록 작업"
                  className="absolute top-9 right-0 z-20 min-w-[104px] overflow-hidden rounded-2xl border border-[#e4e4e4] bg-white shadow-lg"
                >
                  {[
                    ...(canEdit ? [{ label: '수정', action: onEdit }] : []),
                    ...(canDelete
                      ? [{ label: '삭제', action: () => setDeleteOpen(true) }]
                      : []),
                    ...(canChangeVisibility
                      ? [
                          {
                            label: `${visibilityTargetLabel}로 전환`,
                            action: onVisibilityChange,
                          },
                        ]
                      : []),
                  ].map(({ label, action }) => (
                    <button
                      key={label}
                      type="button"
                      role="menuitem"
                      disabled={isPending}
                      onClick={() => {
                        setMenuOpen(false);
                        action();
                      }}
                      className="text-gray-4 hover:bg-background block h-[42px] w-full px-4 text-left text-sm whitespace-nowrap disabled:opacity-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>
      <div className="border-gray-2 my-[60px] border-t" />
      <PhotoGallery photos={photos} title={folder.title} />
      {shareOpen && inviteFolder ? (
        <TravelRecordShareModal
          folder={inviteFolder}
          sharerName={profileName}
          sharerProfileImageUrl={profileImageUrl}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="travel-record-delete-title"
            className="w-full max-w-[342px] rounded-2xl bg-white p-6"
          >
            <h2
              id="travel-record-delete-title"
              className="text-xl font-semibold"
            >
              여행 기록을 삭제할까요?
            </h2>
            <p className="text-gray-4 mt-3 text-sm">
              삭제한 기록은 되돌릴 수 없어요.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="bg-gray-2 text-gray-5 h-11 flex-1 rounded-xl text-sm font-semibold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                className="bg-main-5 h-11 flex-1 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              >
                삭제
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </DesktopPageShell>
  );
}

export default TravelRecordDetailDesktop;
