import { useEffect, useRef, useState } from 'react';
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

import { getApiErrorMessage } from '../../../apis/common';
import { useToast } from '../../../components/toast';
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

function TravelRecordDetailPage() {
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
  const [isDeleted, setIsDeleted] = useState(false);
  const { showToast } = useToast();
  const beginEdit = useTravelRecordSessionStore((state) => state.beginEdit);
  const [transitionTargetIndex, setTransitionTargetIndex] = useState<
    number | null
  >(null);
  const locationState =
    location.state as TravelRecordDetailLocationState | null;
  const travelRecordId =
    folderId && /^\d+$/.test(folderId) ? Number(folderId) : null;
  const serverTravelRecordQuery = useTravelRecordDetail(
    isDeleted ? null : travelRecordId,
  );
  const deleteTravelRecordMutation = useDeleteTravelRecord();
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
  }, [folder?.id]);

  useEffect(() => {
    if (!isActionMenuOpen) {
      return;
    }

    const closeActionMenuOnOutsideClick = (event: PointerEvent) => {
      if (!actionMenuRef.current?.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeActionMenuOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeActionMenuOnOutsideClick);
    };
  }, [isActionMenuOpen]);

  // 삭제가 성공하면 상세 캐시가 제거되어 folder가 비는데, 목록으로
  // 이동하기 전 한 프레임 동안 "찾을 수 없어요"가 스치는 것을 막는다.
  if (
    travelRecordId &&
    !folder &&
    (serverTravelRecordQuery.isLoading || isDeleted)
  ) {
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
                  missingRecordLabel,
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('여행 기록 주소를 복사했어요.');
    } catch {
      showToast('주소를 복사하지 못했어요.');
    }
  };

  const handleEdit = async () => {
    if (!travelRecordId) {
      return;
    }

    const editableFolder = serverTravelRecordQuery.data;

    if (!editableFolder) {
      showToast('여행 기록을 불러오는 중이에요.');
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
    const endDate = new Date(`${editableFolder.endDate ?? editableFolder.startDate}T00:00:00`);
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
      decorations: editableFolder.decorations,
      title: editableFolder.title,
      regionId: editableFolder.regionId,
    });
    navigate(getTravelRecordEditRoute(String(travelRecordId)));
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

  return (
    <TravelRecordPageFrame className="bg-[#f1f1f1] px-6 pt-[60px]">
      <header className="relative h-[146px]">
        <div className="absolute top-0 left-6 h-[152px] w-[132px] origin-top-left scale-[0.83]">
          <TravelFolderArtwork
            photos={folderPhotos}
            title={folder.title}
            decorations={folder.decorations}
          />
        </div>
        <div className="absolute top-[76px] right-[17px] flex w-[110px] flex-col items-center gap-1.5">
          <h1 className="text-center text-[20px] leading-none font-semibold text-[#1c1c1c]">
            {folder.title}
          </h1>
          <time className="shrink-0 whitespace-nowrap rounded-full bg-[#e4e4e4] px-2 py-1 text-[16px] leading-none text-[#7f7f7f]">
            {folder.period}
          </time>
        </div>
        <div ref={actionMenuRef} className="absolute top-0 right-0 z-20">
          <button
            type="button"
            aria-label="여행 기록 메뉴"
            aria-controls="travel-record-action-menu"
            aria-expanded={isActionMenuOpen}
            onClick={() => setIsActionMenuOpen((isOpen) => !isOpen)}
            className="flex size-8 items-center justify-center text-[#1c1c1c]"
          >
            <IoEllipsisVertical aria-hidden="true" className="text-[24px]" />
          </button>

          {isActionMenuOpen && (
            <div
              id="travel-record-action-menu"
              role="menu"
              aria-label="여행 기록 작업"
              className="absolute top-9 right-0 w-[104px] overflow-hidden rounded-2xl border border-[#e4e4e4] bg-[#f9f9f9] shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            >
              {[
                { label: '수정', onClick: () => void handleEdit() },
                { label: '삭제', onClick: () => setIsDeleteDialogOpen(true) },
                { label: '공유', onClick: () => void handleShare() },
              ].map(({ label, onClick }) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    onClick();
                  }}
                  className="flex h-[42px] w-full items-center border-b border-[#e4e4e4] px-4 text-left text-sm font-medium text-[#7f7f7f] last:border-b-0 hover:bg-[#f1f1f1] focus-visible:bg-[#f1f1f1] focus-visible:outline-none"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="travel-record-delete-title"
            className="w-full max-w-[342px] rounded-2xl bg-[#f9f9f9] p-6"
          >
            <h2 id="travel-record-delete-title" className="text-xl font-semibold text-[#1c1c1c]">
              여행 기록을 삭제할까요?
            </h2>
            <p className="mt-3 text-sm text-[#7f7f7f]">삭제한 기록은 되돌릴 수 없어요.</p>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setIsDeleteDialogOpen(false)} className="h-11 flex-1 rounded-xl bg-[#e4e4e4] text-sm font-semibold text-[#505050]">취소</button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleteTravelRecordMutation.isPending}
                className="h-11 flex-1 rounded-xl bg-[#ff6f41] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                삭제
              </button>
            </div>
          </section>
        </div>
      )}

      <div
        ref={photoStackRef}
        role="region"
        aria-label={`${folder.title} 여행 사진`}
        className="relative mt-6 h-[456px] w-full overflow-hidden"
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
                className="absolute inset-0 overflow-hidden rounded-[24px] bg-[#e4e4e4]"
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

      <div className="mt-8 flex justify-center gap-[15px] overflow-hidden">
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
              <img src={photo} alt="" className="block size-full object-cover" />
            )}
            {selectedThumbnailIndex !== index && (
              <span
                className="pointer-events-none absolute inset-0 bg-black/45"
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
