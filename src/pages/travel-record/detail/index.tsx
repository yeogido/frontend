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

import { TravelFolderArtwork, TravelRecordPageFrame } from '../components';
import { TRAVEL_RECORD_FOLDERS } from '../constants/travelRecords';
import type { TravelRecordFolder } from '../types';
import {
  getSavedTravelRecordFolder,
  revokeTravelRecordFolderPhotoUrls,
  SAVED_TRAVEL_RECORD_ID_PREFIX,
} from '../utils/travelRecordSave';

interface TravelRecordDetailLocationState {
  folder?: TravelRecordFolder;
}

interface SavedFolderState {
  id: string;
  folder: TravelRecordFolder | null;
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
  const dragX = useMotionValue(0);
  const isMountedRef = useRef(true);
  const transitionControlsRef = useRef<{ stop: () => void } | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [isPhotoTransitioning, setIsPhotoTransitioning] = useState(false);
  const [transitionTargetIndex, setTransitionTargetIndex] = useState<
    number | null
  >(null);
  const [savedFolderState, setSavedFolderState] =
    useState<SavedFolderState | null>(null);
  const locationState =
    location.state as TravelRecordDetailLocationState | null;
  const isSavedFolder =
    folderId?.startsWith(SAVED_TRAVEL_RECORD_ID_PREFIX) ?? false;
  const staticFolder =
    locationState?.folder ??
    TRAVEL_RECORD_FOLDERS.find((record) => record.id === folderId);
  const savedFolder =
    savedFolderState && savedFolderState.id === folderId
      ? savedFolderState.folder
      : undefined;
  const folder = isSavedFolder ? savedFolder : staticFolder;
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
    if (!isSavedFolder || !folderId) {
      return;
    }

    let isMounted = true;
    let loadedFolder: TravelRecordFolder | null = null;

    void getSavedTravelRecordFolder(folderId)
      .then((folder) => {
        loadedFolder = folder;

        if (isMounted) {
          setSavedFolderState({ id: folderId, folder });
          return;
        }

        if (folder) {
          revokeTravelRecordFolderPhotoUrls(folder);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSavedFolderState({ id: folderId, folder: null });
        }
      });

    return () => {
      isMounted = false;

      if (loadedFolder) {
        revokeTravelRecordFolderPhotoUrls(loadedFolder);
      }
    };
  }, [folderId, isSavedFolder]);

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

  if (isSavedFolder && savedFolder === undefined) {
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
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="text-base font-medium text-[#7f7f7f]">
            {missingRecordLabel}
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

  const lastPhotoIndex = folder.photos.length - 1;
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

  return (
    <TravelRecordPageFrame className="bg-[#f1f1f1] px-6 pt-[60px]">
      <header className="relative h-[146px]">
        <div className="absolute top-0 left-6 h-[152px] w-[132px] origin-top-left scale-[0.83]">
          <TravelFolderArtwork photos={folder.photos} title={folder.title} />
        </div>
        <div className="absolute top-[76px] right-[17px] flex w-[110px] flex-col items-center gap-1.5">
          <h1 className="text-center text-[20px] leading-none font-semibold text-[#1c1c1c]">
            {folder.title}
          </h1>
          <time className="rounded-full bg-[#e4e4e4] px-2 py-1 text-[16px] leading-none text-[#7f7f7f]">
            {folder.period}
          </time>
        </div>
        <IoEllipsisVertical
          aria-hidden="true"
          className="absolute top-0 right-0 text-[24px] text-[#1c1c1c]"
        />
      </header>

      <div
        ref={photoStackRef}
        role="region"
        aria-label={`${folder.title} 여행 사진`}
        className="relative mt-6 h-[456px] w-full overflow-hidden"
      >
        <AnimatePresence initial={false}>
          {visiblePhotoIndexes.map((index) => {
            const photo = folder.photos[index];
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
                <img
                  src={photo}
                  alt={`${folder.title} 여행 사진 ${index + 1}`}
                  className="block size-full object-cover"
                />
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-center gap-[15px] overflow-hidden">
        {folder.photos.map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            disabled={isPhotoTransitioning}
            onClick={() => startPhotoTransition(index, thumbnailTransition)}
            aria-label={`${folder.title} 여행 사진 ${index + 1} 보기`}
            aria-pressed={selectedThumbnailIndex === index}
            className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#e4e4e4] disabled:cursor-default"
          >
            <img src={photo} alt="" className="block size-full object-cover" />
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
