import { createPortal } from 'react-dom';

import {
  FolderDecorationCanvas,
  FolderDecorationPalette,
} from '../../folder-decoration/components';
import { getDraggingStickerPreviewStyle } from '../../folder-decoration/folderDecoration';
import { useFolderDecorationPage } from '../../folder-decoration/useFolderDecorationPage';
import CreateStepLayout from './CreateStepLayout';
import FolderPreviewCard from './FolderPreviewCard';

// 데스크톱 뷰는 시안 리터럴 px이라 모바일의 전역 스케일을 쓰지 않는다.
const DESKTOP_SCALE = 1;
const STICKER_LIMIT_MESSAGE = '스티커는 최대 10개까지 등록할 수 있어요.';

/** Figma 6330:64986 — 여행 폴더를 더 특별하게 꾸며보세요. */
function FolderDecorationDesktopPage() {
  const {
    decorations,
    draggingSticker,
    folderCanvasRef,
    folderPhotos,
    isEditorLocked,
    isSaveComplete,
    isSaving,
    periodLabel,
    regionName,
    selectedPhotos,
    appendDecoration,
    handleSaveRecord,
    handleStickerDragStart,
    replaceDecorations,
    showToast,
  } = useFolderDecorationPage();

  return (
    <CreateStepLayout
      title="여행 폴더를 더 특별하게 꾸며보세요"
      description="스티커를 추가해 나만의 폴더를 만들어 보세요. (선택)"
      actionLabel="기록 저장하기"
      actionDisabled={isSaving || !selectedPhotos?.length}
      actionBusy={isSaving}
      onAction={() => void handleSaveRecord()}
      preview={
        <FolderPreviewCard
          art={
            folderPhotos ? (
              <FolderDecorationCanvas
                canvasRef={folderCanvasRef}
                photos={folderPhotos}
                title={regionName}
                decorations={decorations}
                onChange={replaceDecorations}
                isSaveComplete={isSaveComplete}
                isInteractionDisabled={isEditorLocked}
              />
            ) : null
          }
          regionName={regionName}
          caption={
            periodLabel ? (
              <span className="text-gray-5 rounded-full bg-[#e4e4e4] px-[12px] py-[6px] text-[14px]">
                {periodLabel}
              </span>
            ) : null
          }
        />
      }
    >
      <FolderDecorationPalette
        desktop
        decorations={decorations}
        onLimitReached={() => showToast(STICKER_LIMIT_MESSAGE)}
        onAddSticker={appendDecoration}
        onStickerDragStart={handleStickerDragStart}
        isInteractionDisabled={isEditorLocked}
      />

      {draggingSticker
        ? createPortal(
            <img
              src={draggingSticker.seed.imageUrl}
              alt=""
              aria-hidden="true"
              className="pointer-events-none fixed z-70 size-[58px] object-contain"
              style={getDraggingStickerPreviewStyle(
                draggingSticker.current,
                DESKTOP_SCALE
              )}
            />,
            document.body
          )
        : null}
    </CreateStepLayout>
  );
}

export default FolderDecorationDesktopPage;
