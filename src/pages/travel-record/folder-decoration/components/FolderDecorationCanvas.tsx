import { useEffect, useRef, useState } from 'react';
import { IoResizeOutline } from 'react-icons/io5';

import closeRoundedIcon from '../../../../assets/icons/close-rounded.svg';
import { TravelFolderArtwork } from '../../components';
import { getDecorationLayerStyle } from '../../components/decorationRender';
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
}

type EditorMode = 'drag' | 'rotate' | 'resize';

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
}: FolderDecorationCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);
  const pointerEditStateRef = useRef<PointerEditState | null>(null);
  const selectedDecoration = decorations.find(
    (decoration) => decoration.id === selectedId,
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
    event: React.PointerEvent<HTMLButtonElement>,
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

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!selectedDecoration || !editorMode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    if (editorMode === 'drag') {
      const point = getDecorationDragPoint(rect, event.clientX, event.clientY);
      if (!isPointInFolderDecorationLayout(point)) return;

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

    if (editorMode === 'rotate') {
      updateDecoration(selectedDecoration.id, {
        rotation: getDecorationRotationFromPointerDelta(
          pointerEditState.initialRotation,
          center,
          pointerEditState.initialPointer,
          currentPointer,
        ),
      });
      return;
    }

    const scale = getDecorationScaleFromPointerDistance(
      pointerEditState.initialScale,
      center,
      pointerEditState.initialPointer,
      currentPointer,
    );

    updateDecoration(selectedDecoration.id, { scale });
  };

  const endEditing = (event: React.PointerEvent<HTMLDivElement>) => {
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
      <TravelFolderArtwork
        photos={photos}
        title={title}
        decorations={decorations}
      />
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
                  aria-label="\uC2A4\uD2F0\uCEE4 \uD68C\uC804"
                  className="absolute -bottom-3 left-1/2 flex size-6 -translate-x-1/2 items-center justify-center rounded-full bg-[#ff6f41] text-xs text-white"
                  onPointerDown={(event) =>
                    beginPointerEditing(event, decoration, 'rotate')
                  }
                >
                  R
                </button>
                <button
                  type="button"
                  aria-label="\uC2A4\uD2F0\uCEE4 \uD06C\uAE30 \uC870\uC808"
                  title="\uD06C\uAE30 \uC870\uC808"
                  className="absolute -right-3 -bottom-3 flex size-6 items-center justify-center rounded-full bg-[#ff6f41] text-white"
                  onPointerDown={(event) =>
                    beginPointerEditing(event, decoration, 'resize')
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
