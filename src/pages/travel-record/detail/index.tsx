import DesktopLoadingPage from '../../../components/common/DesktopLoadingPage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
  type Transition,
} from 'motion/react';
import { IoEllipsisVertical } from 'react-icons/io5';

import uploadIcon from '../../../assets/icons/upload.svg';
import { getApiErrorMessage } from '../../../apis/common';
import { useToast } from '../../../components/toast';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAuthStore } from '../../../store/auth.store';
import {
  useLeaveTravelRecord,
  type LeaveTravelRecordVariables,
} from '../../../hooks/useLeaveTravelRecord';
import { canLeaveTravelRecord } from '../utils/leavePermission';
import { toTravelRecordApiVisibility } from '../mappers/travelRecordVisibility';
import {
  useDeleteTravelRecord,
  useTravelRecordDetail,
} from '../../../hooks/useTravelRecords';
import { useTravelRecordSessionStore } from '../../../store/travelRecordSession.store';
import { TravelFolderArtwork, TravelRecordPageFrame } from '../components';
import type { TravelRecordFolder } from '../types';
import { saveTravelRecordPhotoDraft } from '../utils/travelRecordSave';
import {
  saveTravelRecordDraftDateRange,
  saveTravelRecordDraftRegion,
} from '../utils/draftStorage';
import { getTravelRecordEditRoute } from '../utils/editRoute';
import { hasTravelRecordVersion } from '../utils/editVersion';
import { getTravelRecordActionPermissions } from '../utils/travelRecordPermissions';
import TravelRecordMembers from './components/TravelRecordMembers';
import TravelRecordShareModal from './components/TravelRecordShareModal';
import { getFriendAvatarColor } from '../../friends/utils/friendAvatarColor';
import DesktopPageShell from '../../../components/layout/desktop/DesktopPageShell';
import TravelRecordDetailDesktop from './desktop/TravelRecordDetailDesktop';

interface TravelRecordDetailLocationState {
  folder?: TravelRecordFolder;
}

const missingRecordLabel = '여행 기록을 찾을 수 없어요';
const backToArchiveLabel = '보관 화면으로 돌아가기';
const dragDistanceRatio = 0.28;
const cardStackOffset = 24;
const swipeVelocityThreshold = 500;
const springTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const;
const thumbnailTransition: Transition = {
  type: 'tween',
  duration: 0.18,
  ease: 'easeOut',
};

function TravelRecordDetailPage({ desktop = false }: { desktop?: boolean }) {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const photoStackRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const isMountedRef = useRef(true);
  const transitionControlsRef = useRef<{ stop: () => void } | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [isPhotoTransitioning, setIsPhotoTransitioning] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leaveConfirmation, setLeaveConfirmation] =
    useState<LeaveTravelRecordVariables | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const closeShareModal = useCallback(() => setIsShareModalOpen(false), []);
  const [isDeleted, setIsDeleted] = useState(false);
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const [leaveRequest, setLeaveRequest] =
    useState<LeaveTravelRecordVariables | null>(null);
  const leaveLocksRef = useRef(new Set<string>());
  const currentFolderIdRef = useRef(folderId);
  useEffect(() => {
    currentFolderIdRef.current = folderId;
  }, [folderId]);
  const { showToast } = useToast();
  const beginEdit = useTravelRecordSessionStore((state) => state.beginEdit);
  const [transitionTargetIndex, setTransitionTargetIndex] = useState<
    number | null
  >(null);
  const locationState =
    location.state as TravelRecordDetailLocationState | null;
  const travelRecordId =
    folderId && /^\d+$/.test(folderId) ? Number(folderId) : null;
  const isLeaving =
    leaveRequest !== null &&
    leaveRequest.travelRecordId === travelRecordId &&
    leaveRequest.userId === userId &&
    leaveRequest.authGeneration === authGeneration;
  const serverTravelRecordQuery = useTravelRecordDetail(
    isDeleted || isLeaving ? null : travelRecordId
  );
  const deleteTravelRecordMutation = useDeleteTravelRecord();
  const leaveMutation = useLeaveTravelRecord();
  const isDetailActionPending = isLeaving;
  const inviteFolder = serverTravelRecordQuery.data;
  const canOpenShare = inviteFolder?.permissions?.canLinkShare === true;
  const canLeave = canLeaveTravelRecord(inviteFolder, userId);
  const isLeaveDialogOpen =
    canLeave &&
    leaveConfirmation?.travelRecordId === travelRecordId &&
    leaveConfirmation.userId === userId &&
    leaveConfirmation.authGeneration === authGeneration;
  const isSharedFolderWithParticipants =
    inviteFolder?.visibility === 'friends' &&
    inviteFolder.owner?.userId === userId &&
    (inviteFolder.participants?.some(
      (member) => member.userId !== inviteFolder.owner?.userId
    ) ??
      false);
  const { canEdit, canDelete } = getTravelRecordActionPermissions(
    inviteFolder,
    userId
  );
  const hasActionMenuItems = canEdit || canDelete || canLeave;
  // 목록에서 넘어오면 location.state에 요약 폴더가 실려 있다. 상세 조회가
  // 실패했는데도 그걸 그대로 그리면 남의 기록(403)이나 이미 지워진 기록(404)이
  // 정상 화면처럼 보이므로, 실패했을 때는 캐시 데이터를 쓰지 않는다.
  const folder = serverTravelRecordQuery.isError
    ? undefined
    : (serverTravelRecordQuery.data ?? locationState?.folder);
  const motionRange = Math.max(cardWidth, 1);
  const cardDistance = cardWidth + cardStackOffset;
  const previousCardX = useTransform(dragX, (value) => -cardDistance + value);
  const nextCardX = useTransform(dragX, (value) => cardDistance + value);
  const previousCardScale = useTransform(dragX, [0, motionRange], [0.98, 1]);
  const nextCardScale = useTransform(dragX, [-motionRange, 0], [1, 0.98]);
  const previousCardOpacity = useTransform(dragX, [0, motionRange], [0.92, 1]);
  const nextCardOpacity = useTransform(dragX, [-motionRange, 0], [1, 0.92]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      transitionControlsRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    const photoStack = photoStackRef.current;

    if (!photoStack) {
      return;
    }

    const updateCardWidth = () => setCardWidth(photoStack.clientWidth);

    updateCardWidth();
    const resizeObserver = new ResizeObserver(updateCardWidth);
    resizeObserver.observe(photoStack);

    return () => resizeObserver.disconnect();
  }, [folder?.id, desktop]);

  useEffect(() => {
    if (!isActionMenuOpen) {
      return;
    }

    const closeActionMenuOnOutsideClick = (event: PointerEvent) => {
      if (!actionMenuRef.current?.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };
    const closeActionMenuOnEscape = (event: KeyboardEvent) => {
      if (desktop && event.key === 'Escape') {
        setIsActionMenuOpen(false);
        actionMenuRef.current
          ?.querySelector<HTMLButtonElement>('button')
          ?.focus();
      }
    };

    document.addEventListener('pointerdown', closeActionMenuOnOutsideClick);
    document.addEventListener('keydown', closeActionMenuOnEscape);

    return () => {
      document.removeEventListener(
        'pointerdown',
        closeActionMenuOnOutsideClick
      );
      document.removeEventListener('keydown', closeActionMenuOnEscape);
    };
  }, [isActionMenuOpen, desktop]);

  // 삭제가 성공하면 상세 캐시가 제거되어 folder가 비는데, 목록으로
  // 이동하기 전 한 프레임 동안 "찾을 수 없어요"가 스치는 것을 막는다.
  if (
    travelRecordId &&
    !folder &&
    (serverTravelRecordQuery.isLoading || isDeleted || isLeaving)
  ) {
    if (desktop) return <DesktopLoadingPage />;
    return (
      <TravelRecordPageFrame className="bg-[#f1f1f1]">
        <div
          aria-busy="true"
          className="flex h-full items-center justify-center"
        />
      </TravelRecordPageFrame>
    );
  }

  if (!folder) {
    if (desktop)
      return (
        <DesktopPageShell contentWidth={1048}>
          <div
            role={serverTravelRecordQuery.isError ? 'alert' : undefined}
            className="flex min-h-[400px] flex-col items-center justify-center text-center"
          >
            <p className="text-gray-4">
              {serverTravelRecordQuery.isError
                ? getApiErrorMessage(
                    serverTravelRecordQuery.error,
                    missingRecordLabel
                  )
                : missingRecordLabel}
            </p>
            <button
              type="button"
              onClick={() => navigate('/travel-record')}
              className="mt-4 text-sm font-semibold"
            >
              {backToArchiveLabel}
            </button>
          </div>
        </DesktopPageShell>
      );
    return (
      <TravelRecordPageFrame className="bg-[#f1f1f1] px-6">
        <div
          role={serverTravelRecordQuery.isError ? 'alert' : undefined}
          className="flex h-full flex-col items-center justify-center text-center"
        >
          <p className="text-base font-medium text-[#7f7f7f]">
            {serverTravelRecordQuery.isError
              ? getApiErrorMessage(
                  serverTravelRecordQuery.error,
                  missingRecordLabel
                )
              : missingRecordLabel}
          </p>
          <button
            type="button"
            onClick={() => navigate('/travel-record')}
            className="mt-4 text-sm font-semibold text-[#1c1c1c]"
          >
            {backToArchiveLabel}
          </button>
        </div>
      </TravelRecordPageFrame>
    );
  }

  const folderPhotos: [string, ...string[]] =
    Array.isArray(folder.photos) && folder.photos.length > 0
      ? folder.photos
      : [''];
  const lastPhotoIndex = folderPhotos.length - 1;
  const visiblePhotoIndexes =
    isPhotoTransitioning && transitionTargetIndex !== null
      ? [activePhotoIndex, transitionTargetIndex]
      : [activePhotoIndex - 1, activePhotoIndex, activePhotoIndex + 1].filter(
          (index) => index >= 0 && index <= lastPhotoIndex
        );

  const finishPhotoTransition = (nextPhotoIndex: number) => {
    setActivePhotoIndex(nextPhotoIndex);
    setTransitionTargetIndex(null);
    dragX.set(0);
    setIsPhotoTransitioning(false);
  };

  const startPhotoTransition = (
    nextPhotoIndex: number,
    transition: Transition = springTransition
  ) => {
    if (
      isPhotoTransitioning ||
      nextPhotoIndex < 0 ||
      nextPhotoIndex > lastPhotoIndex ||
      nextPhotoIndex === activePhotoIndex
    ) {
      return;
    }

    const direction = Math.sign(nextPhotoIndex - activePhotoIndex);

    setSelectedThumbnailIndex(nextPhotoIndex);
    setTransitionTargetIndex(nextPhotoIndex);
    setIsPhotoTransitioning(true);
    transitionControlsRef.current?.stop();
    const transitionControls = animate(
      dragX,
      -direction * cardDistance,
      transition
    );

    transitionControlsRef.current = transitionControls;
    transitionControls.then(() => {
      if (isMountedRef.current) {
        finishPhotoTransition(nextPhotoIndex);
      }
    });
  };

  const handlePhotoDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const shouldMovePhoto =
      Math.abs(info.offset.x) > cardWidth * dragDistanceRatio ||
      Math.abs(info.velocity.x) > swipeVelocityThreshold;

    if (!shouldMovePhoto) {
      animate(dragX, 0, springTransition);
      return;
    }

    const isDistanceSwipe =
      Math.abs(info.offset.x) > cardWidth * dragDistanceRatio;
    const nextPhotoIndex =
      (isDistanceSwipe ? info.offset.x : info.velocity.x) < 0
        ? activePhotoIndex + 1
        : activePhotoIndex - 1;

    if (nextPhotoIndex < 0 || nextPhotoIndex > lastPhotoIndex) {
      animate(dragX, 0, springTransition);
      return;
    }

    startPhotoTransition(nextPhotoIndex);
  };

  const getPhotoCardStyle = (index: number) => {
    if (index === activePhotoIndex) {
      return { x: dragX, zIndex: 2 };
    }

    if (index < activePhotoIndex) {
      return {
        x: previousCardX,
        scale: previousCardScale,
        opacity: previousCardOpacity,
        zIndex: 1,
      };
    }

    return {
      x: nextCardX,
      scale: nextCardScale,
      opacity: nextCardOpacity,
      zIndex: 1,
    };
  };

  const handleEdit = async () => {
    if (!travelRecordId) {
      return;
    }

    const refreshed = await serverTravelRecordQuery.refetch();
    const editableFolder = refreshed.isError ? undefined : refreshed.data;

    if (!editableFolder) {
      showToast('최신 여행 기록을 불러오지 못했어요. 다시 시도해 주세요.');
      return;
    }

    if (!hasTravelRecordVersion(editableFolder.version)) {
      showToast('수정 버전을 확인할 수 없어요. 상세 화면을 새로고침해 주세요.');
      return;
    }

    if (!editableFolder.serverPhotos?.length) {
      showToast('사진 정보가 없어 수정할 수 없어요.');
      return;
    }

    const photos = editableFolder.serverPhotos.map((photo) => ({
      source: 'server' as const,
      imageKey: photo.imageKey,
      imageUrl: photo.imageUrl,
    }));

    const startDate = new Date(`${editableFolder.startDate}T00:00:00`);
    const endDate = new Date(
      `${editableFolder.endDate ?? editableFolder.startDate}T00:00:00`
    );
    saveTravelRecordDraftRegion({
      id: String(editableFolder.regionId ?? editableFolder.regionCode),
      regionId: editableFolder.regionId,
      name: editableFolder.regionName,
      province: editableFolder.regionName,
      selectionName: editableFolder.regionName,
    });
    saveTravelRecordDraftDateRange({ startDate, endDate });

    try {
      // IndexedDB가 막혀 있으면 실패한다. 사진 초안 없이 수정 화면으로
      // 넘어가면 사진이 빈 상태가 되므로 이동하지 않고 안내한다.
      await saveTravelRecordPhotoDraft(photos);
    } catch {
      showToast('여행 사진을 불러오지 못해 수정할 수 없어요.');
      return;
    }

    beginEdit({
      id: editableFolder.id,
      version: editableFolder.version,
      visibility: toTravelRecordApiVisibility(editableFolder.visibility),
      ownerId: editableFolder.owner?.userId,
      hasOtherParticipants: editableFolder.participants
        ? editableFolder.participants.some(
            (member) => member.userId !== editableFolder.owner?.userId
          )
        : undefined,
      decorations: editableFolder.decorations,
      title: editableFolder.title,
      regionId: editableFolder.regionId,
    });
    navigate(getTravelRecordEditRoute(String(travelRecordId)));
  };

  const handleLeave = async () => {
    const session = useAuthStore.getState();
    if (
      !travelRecordId ||
      isDeleted ||
      isDetailActionPending ||
      session.userId === null ||
      session.userId !== userId ||
      session.authGeneration !== authGeneration ||
      !canLeaveTravelRecord(serverTravelRecordQuery.data, session.userId)
    )
      return;
    const variables: LeaveTravelRecordVariables = {
      travelRecordId,
      userId: session.userId,
      authGeneration: session.authGeneration,
    };
    const key = `${session.userId}:${session.authGeneration}:${travelRecordId}`;
    if (leaveLocksRef.current.has(key)) return;
    leaveLocksRef.current.add(key);
    const startedFolderId = folderId;
    const canUpdatePage = () => {
      const current = useAuthStore.getState();
      return (
        isMountedRef.current &&
        currentFolderIdRef.current === startedFolderId &&
        current.userId === session.userId &&
        current.authGeneration === session.authGeneration
      );
    };
    setLeaveRequest(variables);
    try {
      await leaveMutation.mutateAsync(variables);
      if (!canUpdatePage()) return;
      showToast('폴더에서 나왔어요.');
      navigate('/travel-record', { replace: true });
    } catch (error) {
      if (canUpdatePage())
        showToast(
          getApiErrorMessage(
            error,
            '폴더에서 나가지 못했어요. 다시 시도해 주세요.'
          )
        );
    } finally {
      leaveLocksRef.current.delete(key);
      if (isMountedRef.current) {
        setLeaveConfirmation((current) =>
          current?.travelRecordId === variables.travelRecordId &&
          current.userId === variables.userId &&
          current.authGeneration === variables.authGeneration
            ? null
            : current
        );
        setLeaveRequest((current) =>
          current?.travelRecordId === variables.travelRecordId &&
          current.userId === variables.userId &&
          current.authGeneration === variables.authGeneration
            ? null
            : current
        );
      }
    }
  };

  const handleDelete = async () => {
    if (!travelRecordId) {
      return;
    }

    // Disable this page's detail query before the mutation removes its
    // cache entry, so react-query doesn't treat it as an active observer
    // and immediately re-fetch the record we're about to delete.
    setIsDeleted(true);

    try {
      await deleteTravelRecordMutation.mutateAsync(travelRecordId);
    } catch (error) {
      setIsDeleted(false);
      showToast(getApiErrorMessage(error, '여행 기록을 삭제하지 못했어요.'));
      return;
    }

    navigate('/travel-record');
  };

  const openLeaveDialog = () => {
    if (travelRecordId && userId !== null)
      setLeaveConfirmation({ travelRecordId, userId, authGeneration });
  };
  const actionDialogs = (
    <>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={
          isSharedFolderWithParticipants
            ? '공유 폴더를 삭제할까요?'
            : '여행 기록을 삭제할까요?'
        }
        description={
          isSharedFolderWithParticipants
            ? '삭제하면 모든 참여자가 이 폴더를 볼 수 없어요.\n사진·스티커도 함께 삭제되며, 되돌릴 수 없어요.'
            : '삭제한 기록은 되돌릴 수 없어요.'
        }
        isPending={deleteTravelRecordMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleteTravelRecordMutation.isPending)
            setIsDeleteDialogOpen(false);
        }}
      />

      <ConfirmDialog
        isOpen={isLeaveDialogOpen}
        title="공유 폴더에서 나갈까요?"
        description="나가도 다른 참여자의 폴더는 그대로 유지돼요."
        confirmLabel="나가기"
        isPending={isLeaving}
        onConfirm={() => void handleLeave()}
        onCancel={() => {
          if (!isLeaving) setLeaveConfirmation(null);
        }}
      />
    </>
  );

  if (desktop) {
    return (
      <>
        <TravelRecordDetailDesktop
          folder={folder}
          inviteFolder={inviteFolder}
          menuRef={actionMenuRef}
          menuOpen={isActionMenuOpen}
          setMenuOpen={setIsActionMenuOpen}
          shareOpen={isShareModalOpen}
          setShareOpen={setIsShareModalOpen}
          setDeleteOpen={setIsDeleteDialogOpen}
          isPending={isDetailActionPending}
          canEdit={canEdit}
          canDelete={canDelete}
          canLeave={canLeave}
          canOpenShare={canOpenShare}
          onEdit={() => void handleEdit()}
          onLeave={openLeaveDialog}
        />
        {actionDialogs}
      </>
    );
  }

  return (
    <TravelRecordPageFrame className="bg-[#f1f1f1] px-6">
      <header className="relative min-h-[146px] pb-2">
        <div className="absolute top-0 left-6 h-[152px] w-[132px] origin-top-left scale-[0.83]">
          <TravelFolderArtwork
            photos={folderPhotos}
            title={folder.title}
            decorations={folder.decorations}
          />
        </div>
        <div className="ml-[198px] flex w-[110px] flex-col items-start gap-1.5 pt-[39px]">
          <h1 className="w-full text-[20px] leading-6 font-semibold break-words text-black">
            {folder.title}
          </h1>
          <time className="bg-gray-2 text-gray-4 shrink-0 rounded-full px-2 py-1 text-[16px] leading-[normal] whitespace-nowrap">
            {folder.period}
          </time>
          {folder.visibility === 'friends' && (
            <TravelRecordMembers
              members={[
                ...(folder.owner ? [folder.owner] : []),
                ...(folder.participants ?? []).filter(
                  (member) => member.userId !== folder.owner?.userId
                ),
              ].map((member) => ({
                id: String(member.userId),
                name: member.nickname,
                color: getFriendAvatarColor(member.userId),
                profileImageUrl: member.profileImageUrl,
              }))}
            />
          )}
        </div>
        <div className="absolute -top-1 -right-1 z-20 flex items-center">
          {canOpenShare && (
            <button
              type="button"
              aria-label="여행 폴더 공유하기"
              disabled={!inviteFolder || isDetailActionPending}
              onClick={() => {
                setIsActionMenuOpen(false);
                setIsShareModalOpen(true);
              }}
              className="focus-visible:outline-main-5 flex size-8 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <img
                src={uploadIcon}
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
              />
            </button>
          )}
          <div ref={actionMenuRef} className="relative">
            {hasActionMenuItems && (
              <button
                type="button"
                aria-label="여행 기록 메뉴"
                disabled={isDetailActionPending}
                aria-controls="travel-record-action-menu"
                aria-expanded={isActionMenuOpen}
                onClick={() => setIsActionMenuOpen((isOpen) => !isOpen)}
                className="focus-visible:outline-main-5 flex size-8 items-center justify-center rounded text-black focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <IoEllipsisVertical
                  aria-hidden="true"
                  className="text-[24px]"
                />
              </button>
            )}

            {isActionMenuOpen && hasActionMenuItems && (
              <div
                id="travel-record-action-menu"
                role="menu"
                aria-label="여행 기록 작업"
                className="absolute top-9 right-0 min-w-[104px] overflow-hidden rounded-2xl border border-[#e4e4e4] bg-[#f9f9f9] shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
              >
                {[
                  ...(canEdit
                    ? [{ label: '수정', onClick: () => void handleEdit() }]
                    : []),
                  ...(canDelete
                    ? [
                        {
                          label: '삭제',
                          onClick: () => setIsDeleteDialogOpen(true),
                        },
                      ]
                    : []),
                ].map(({ label, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    role="menuitem"
                    disabled={isDetailActionPending}
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      onClick();
                    }}
                    className="flex h-[42px] w-full items-center border-b border-[#e4e4e4] px-4 text-left text-sm font-medium whitespace-nowrap text-[#7f7f7f] last:border-b-0 hover:bg-[#f1f1f1] focus-visible:bg-[#f1f1f1] focus-visible:outline-none disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
                {canLeave && (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={isDetailActionPending}
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      if (travelRecordId && userId !== null)
                        setLeaveConfirmation({
                          travelRecordId,
                          userId,
                          authGeneration,
                        });
                    }}
                    className="flex h-[42px] w-full items-center px-4 text-left text-sm font-medium whitespace-nowrap text-[#7f7f7f] hover:bg-[#f1f1f1] focus-visible:bg-[#f1f1f1] focus-visible:outline-none disabled:opacity-50"
                  >
                    나가기
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {isShareModalOpen && inviteFolder && canOpenShare && (
        <TravelRecordShareModal
          folder={inviteFolder}
          sharerName={inviteFolder.owner?.nickname ?? ''}
          sharerProfileImageUrl={inviteFolder.owner?.profileImageUrl}
          onClose={closeShareModal}
        />
      )}

      {actionDialogs}

      <div
        ref={photoStackRef}
        role="region"
        aria-label={`${folder.title} 여행 사진`}
        className="relative mt-6 h-[456px] w-full overflow-hidden rounded-xl shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
      >
        <AnimatePresence initial={false}>
          {visiblePhotoIndexes.map((index) => {
            const photo = folderPhotos[index];
            const isActive = index === activePhotoIndex;

            return (
              <motion.article
                key={`${photo}-${index}`}
                drag={
                  isActive && cardWidth > 0 && !isPhotoTransitioning
                    ? 'x'
                    : false
                }
                dragConstraints={{
                  left: activePhotoIndex < lastPhotoIndex ? -cardDistance : 0,
                  right: activePhotoIndex > 0 ? cardDistance : 0,
                }}
                dragElastic={0}
                dragMomentum={false}
                onDragEnd={handlePhotoDragEnd}
                style={getPhotoCardStyle(index)}
                className="bg-gray-2 absolute inset-0 overflow-hidden rounded-xl"
              >
                {photo && (
                  <img
                    src={photo}
                    alt={`${folder.title} 여행 사진 ${index + 1}`}
                    className="block size-full object-cover"
                  />
                )}
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-center gap-4 overflow-hidden">
        {folderPhotos.map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            disabled={isPhotoTransitioning}
            onClick={() => startPhotoTransition(index, thumbnailTransition)}
            aria-label={`${folder.title} 여행 사진 ${index + 1} 보기`}
            aria-pressed={selectedThumbnailIndex === index}
            className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#e4e4e4] disabled:cursor-default"
          >
            {photo && (
              <img
                src={photo}
                alt=""
                className="block size-full object-cover"
              />
            )}
            {selectedThumbnailIndex !== index && (
              <span
                className="pointer-events-none absolute inset-0 bg-black/43"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>
    </TravelRecordPageFrame>
  );
}

export default TravelRecordDetailPage;
