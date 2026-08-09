import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { motion } from 'motion/react';
import { IoResizeOutline } from 'react-icons/io5';

import closeRoundedIcon from '../../../../assets/icons/close-rounded.svg';
import { TravelFolderArtwork } from '../../components';
import { getDecorationLayerStyle } from '../../components/decorationRender';
import {
  getFolderPhotoSlotIndexes,
  getVisibleFolderPhotos,
} from '../../components/folderPhotos';
import {
  bringDecorationToFront,
  getDecorationDragPoint,
  getDecorationRotationFromPointerDelta,
  getDecorationScaleFromPointerDistance,
  isPointInFolderDecorationLayout,
  type TravelFolderDecoration,
} from '../folderDecoration';

interface FolderDecorationCanvasProps {
  photos: [string, ...string[]];
  title: string;
  decorations: TravelFolderDecoration[];
  onChange: (decorations: TravelFolderDecoration[]) => void;
  /** 목록에서 끌어온 스티커의 드롭 위치를 페이지가 계산할 수 있도록 넘겨받는다. */
  canvasRef: RefObject<HTMLDivElement | null>;
  isSaveComplete?: boolean;
}

/** 핸들 하나로 각도와 크기를 함께 조절한다. */
type EditorMode = 'drag' | 'transform';

interface PointerEditState {
  initialPointer: { x: number; y: number };
  initialRotation: number;
  initialScale: number;
}

export function FolderDecorationCanvas({
  photos,
  title,
  decorations,
  onChange,
  canvasRef,
  isSaveComplete = false,
}: FolderDecorationCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);
  const pointerEditStateRef = useRef<PointerEditState | null>(null);
  const selectedDecoration = decorations.find(
    (decoration) => decoration.id === selectedId,
  );
  // 아트워크가 쓰는 것과 같은 슬롯이어야 한다. 사진이 한 장이면 두 장일 때와
  // 자리가 달라서, 이걸 넘기지 않으면 경계가 없는 사진 위에 걸린다.
  const photoSlotIndexes = getFolderPhotoSlotIndexes(
    getVisibleFolderPhotos(photos).length,
  );

  const updateDecoration = (
    id: string,
    updates: Partial<TravelFolderDecoration>,
  ) =>
    onChange(
      decorations.map((decoration) =>
        decoration.id === id ? { ...decoration, ...updates } : decoration,
      ),
    );

  useEffect(() => {
    const clearSelection = (event: PointerEvent) => {
      const target = event.target;

      if (
        !(target instanceof Element) ||
        !target.closest('[data-decoration-editor-control]')
      ) {
        setSelectedId(null);
        setEditorMode(null);
      }
    };

    document.addEventListener('pointerdown', clearSelection);
    return () => document.removeEventListener('pointerdown', clearSelection);
  }, []);

  const beginPointerEditing = (
    event: ReactPointerEvent<HTMLButtonElement>,
    decoration: TravelFolderDecoration,
    mode: EditorMode,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    onChange(bringDecorationToFront(decorations, decoration.id));
    setSelectedId(decoration.id);
    setEditorMode(mode);
    pointerEditStateRef.current = {
      initialPointer: { x: event.clientX, y: event.clientY },
      initialRotation: decoration.rotation,
      initialScale: decoration.scale,
    };
    canvasRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!selectedDecoration || !editorMode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    if (editorMode === 'drag') {
      const point = getDecorationDragPoint(rect, event.clientX, event.clientY);
      if (!isPointInFolderDecorationLayout(point, photoSlotIndexes)) return;

      updateDecoration(
        selectedDecoration.id,
        point,
      );
      return;
    }

    const pointerEditState = pointerEditStateRef.current;
    if (!pointerEditState) return;

    const center = {
      x: rect.left + selectedDecoration.x * rect.width,
      y: rect.top + selectedDecoration.y * rect.height,
    };
    const currentPointer = { x: event.clientX, y: event.clientY };

    // 중심을 기준으로 핸들을 돌리면 각도가, 멀어지거나 가까워지면 크기가
    // 바뀐다. 한 번에 갱신해야 뒤 호출이 앞 결과를 덮어쓰지 않는다.
    updateDecoration(selectedDecoration.id, {
      rotation: getDecorationRotationFromPointerDelta(
        pointerEditState.initialRotation,
        center,
        pointerEditState.initialPointer,
        currentPointer,
      ),
      scale: getDecorationScaleFromPointerDistance(
        pointerEditState.initialScale,
        center,
        pointerEditState.initialPointer,
        currentPointer,
      ),
    });
  };

  const endEditing = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (editorMode && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerEditStateRef.current = null;
    setEditorMode(null);
  };

  return (
    <div
      ref={canvasRef}
      className="relative h-[183px] w-[159px] touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={endEditing}
      onPointerCancel={endEditing}
    >
      <motion.div
        animate={
          isSaveComplete
            ? { scale: [1, 1.045, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <TravelFolderArtwork
          photos={photos}
          title={title}
          decorations={decorations}
        />
      </motion.div>
      {isSaveComplete ? (
        <span className="pointer-events-none absolute top-[53px] left-0 z-40 h-[130px] w-[159px] overflow-hidden rounded-b-[28px]" aria-hidden="true">
          <motion.span
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 180, opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.42, ease: 'easeInOut' }}
            className="absolute -top-8 h-[190px] w-12 -rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)]"
          />
        </span>
      ) : null}
      {decorations.map((decoration) => {
        const isSelected = decoration.id === selectedId;

        return (
          <div
            key={decoration.id}
            data-decoration-editor-control
            className="absolute z-[70] size-[58px]"
            style={getDecorationLayerStyle(decoration, 70)}
          >
            <button
              type="button"
              aria-label="\uC2A4\uD2F0\uCEE4 \uC120\uD0DD"
              className={`absolute inset-0 rounded-sm ${
                isSelected ? 'border-2 border-[#ff6f41]' : ''
              }`}
              onPointerDown={(event) =>
                beginPointerEditing(event, decoration, 'drag')
              }
            />
            {isSelected ? (
              <>
                <button
                  type="button"
                  aria-label="\uC2A4\uD2F0\uCEE4 \uC0AD\uC81C"
                  className="absolute -top-3 -right-3 flex size-6 items-center justify-center rounded-full bg-[#7f7f7f]"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    onChange(decorations.filter(({ id }) => id !== decoration.id));
                    setSelectedId(null);
                  }}
                >
                  <img
                    src={closeRoundedIcon}
                    alt=""
                    className="size-4 brightness-0 invert"
                  />
                </button>
                <button
                  type="button"
                  aria-label="\uC2A4\uD2F0\uCEE4 \uD06C\uAE30\uC640 \uAC01\uB3C4 \uC870\uC808"
                  title="\uD06C\uAE30\uC640 \uAC01\uB3C4 \uC870\uC808"
                  className="absolute -right-3 -bottom-3 flex size-6 items-center justify-center rounded-full bg-[#ff6f41] text-white"
                  onPointerDown={(event) =>
                    beginPointerEditing(event, decoration, 'transform')
                  }
                >
                  <IoResizeOutline
                    aria-hidden="true"
                    className="scale-x-[-1] text-sm"
                  />
                </button>
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
