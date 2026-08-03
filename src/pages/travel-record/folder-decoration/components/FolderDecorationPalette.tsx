import { useCallback, useEffect, useRef, useState } from 'react';

import { getApiErrorMessage } from '../../../../apis/common';
import { UploadedStickerImage } from '../../../../components/sticker';
import { useToast } from '../../../../components/toast';
import {
  useCreateCustomSticker,
  useDeleteCustomSticker,
  useStickerCatalog,
} from '../../../../hooks/useStickers';
import addRoundedIcon from '../../../../assets/icons/material-symbols_add-2-rounded.svg';
import closeRoundedIcon from '../../../../assets/icons/close-rounded.svg';
import photoUploadIcon from '../../photo-selection/assets/photo-upload-icon.svg';
import {
  CUSTOM_STICKER_CONTENT_TYPE,
  CUSTOM_STICKER_OUTLINE_CLASS,
  getCustomStickerSlotState,
  getPastedStickerImage,
  MAX_FOLDER_DECORATION_COUNT,
  validateCustomStickerFile,
  type FolderDecorationSeed,
  type TravelFolderDecoration,
} from '../folderDecoration';
import {
  getCustomStickers,
  getStickerCategoryGroups,
  STICKER_CATEGORY_LABELS,
} from '../stickerCatalog';
import type { StickerCategory } from '../../../../types/sticker.type';

const pngOnlyMessage = '배경이 없는 PNG 이미지만 추가할 수 있어요.';

interface FolderDecorationPaletteProps {
  decorations: TravelFolderDecoration[];
  onAddSticker: (seed: FolderDecorationSeed) => void;
  onLimitReached: () => void;
}

export function FolderDecorationPalette({
  decorations,
  onAddSticker,
  onLimitReached,
}: FolderDecorationPaletteProps) {
  const { showToast } = useToast();
  const stickerCatalogQuery = useStickerCatalog();
  const createCustomStickerMutation = useCreateCustomSticker();
  const deleteCustomStickerMutation = useDeleteCustomSticker();
  const [selectedCategory, setSelectedCategory] =
    useState<StickerCategory | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryGroups = getStickerCategoryGroups(stickerCatalogQuery.data);
  // 서버가 내려준 순서를 그대로 따르고, 사용자가 고르기 전에는 첫 카테고리를 쓴다.
  const activeCategory = selectedCategory ?? categoryGroups[0]?.category ?? null;
  const activeStickers =
    categoryGroups.find((group) => group.category === activeCategory)
      ?.stickers ?? [];
  const customStickers = getCustomStickers(stickerCatalogQuery.data);
  const customStickerSlotState = getCustomStickerSlotState(
    customStickers.length,
  );
  const isFolderFull = decorations.length >= MAX_FOLDER_DECORATION_COUNT;
  const isCustomCategory = activeCategory === 'CUSTOM';
  const isSavingCustomSticker = createCustomStickerMutation.isPending;

  const selectStickerFile = useCallback(
    (file: File) => {
      const message = validateCustomStickerFile(file);

      if (message) {
        showToast(message);
        return;
      }

      setPendingFile(file);
    },
    [showToast],
  );

  useEffect(() => {
    if (!isUploadModalOpen) {
      return;
    }

    // 아이폰 사진 앱에서 복사한 피사체를 붙여넣는 경로. document에 걸어야
    // 특정 요소에 포커스를 맞추지 않아도 붙여넣기를 받을 수 있다.
    const handlePaste = (event: ClipboardEvent) => {
      const items = Array.from(event.clipboardData?.items ?? []);
      const pastedImage = getPastedStickerImage(items);

      if (!pastedImage) {
        if (items.some((item) => item.kind === 'file')) {
          showToast(pngOnlyMessage);
        }
        return;
      }

      selectStickerFile(pastedImage);
    };

    document.addEventListener('paste', handlePaste);

    return () => document.removeEventListener('paste', handlePaste);
  }, [isUploadModalOpen, selectStickerFile, showToast]);

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setPendingFile(null);
  };

  const addSticker = (stickerId: number, imageUrl: string) => {
    if (isFolderFull) {
      onLimitReached();
      return;
    }

    onAddSticker({ stickerId, imageUrl });
  };

  const handleCreateCustomSticker = async () => {
    if (!pendingFile || isSavingCustomSticker) {
      return;
    }

    try {
      const sticker = await createCustomStickerMutation.mutateAsync(pendingFile);

      closeUploadModal();

      // 등록한 스티커는 바로 폴더에 올려 준다. 폴더가 가득 찼으면 목록에만
      // 남기고 배치는 하지 않는다.
      if (!isFolderFull) {
        onAddSticker({
          stickerId: sticker.stickerId,
          imageUrl: sticker.imageUrl,
        });
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, '스티커를 등록하지 못했어요.'));
    }
  };

  const handleDeleteCustomSticker = async (stickerId: number) => {
    try {
      await deleteCustomStickerMutation.mutateAsync(stickerId);
    } catch (error) {
      showToast(getApiErrorMessage(error, '스티커를 삭제하지 못했어요.'));
    }
  };

  const renderStickerGrid = () => {
    if (stickerCatalogQuery.isPending) {
      return (
        <p
          aria-busy="true"
          className="col-span-5 py-8 text-center text-[14px] text-[#7f7f7f]"
        >
          스티커를 불러오는 중이에요
        </p>
      );
    }

    if (stickerCatalogQuery.isError) {
      return (
        <div className="col-span-5 flex flex-col items-center gap-3 py-6">
          <p className="text-center text-[14px] text-[#7f7f7f]">
            스티커를 불러오지 못했어요
          </p>
          <button
            type="button"
            onClick={() => void stickerCatalogQuery.refetch()}
            className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[14px] text-[#505050]"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (isCustomCategory) {
      return (
        <>
          {customStickers.map((sticker) => (
            <div key={sticker.stickerId} className="relative size-14">
              <button
                type="button"
                aria-label={`${sticker.name} 스티커 추가`}
                onClick={() => addSticker(sticker.stickerId, sticker.imageUrl)}
                className="size-full overflow-hidden rounded-xl bg-[#e4e4e4]"
              >
                <img
                  src={sticker.imageUrl}
                  alt=""
                  loading="lazy"
                  className={`size-full object-contain p-1 ${CUSTOM_STICKER_OUTLINE_CLASS}`}
                />
              </button>
              <button
                type="button"
                aria-label={`${sticker.name} 스티커 삭제`}
                disabled={deleteCustomStickerMutation.isPending}
                onClick={() => void handleDeleteCustomSticker(sticker.stickerId)}
                className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full bg-[#f9f9f9] shadow-[0_2px_8px_rgba(0,0,0,0.16)] disabled:opacity-60"
              >
                <img src={closeRoundedIcon} alt="" className="size-4" />
              </button>
            </div>
          ))}
          {customStickerSlotState.canAdd ? (
            <button
              type="button"
              aria-label="이미지 추가"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex size-14 items-center justify-center rounded-xl bg-[#e4e4e4]"
            >
              <img src={addRoundedIcon} alt="" className="size-8" />
            </button>
          ) : null}
          {Array.from({ length: customStickerSlotState.emptySlotCount }).map(
            (_, index) => (
              <div
                key={`empty-custom-sticker-slot-${index}`}
                className="size-14 rounded-xl bg-[#e4e4e4]"
              />
            ),
          )}
        </>
      );
    }

    return activeStickers.map((sticker) => (
      <button
        key={sticker.stickerId}
        type="button"
        aria-disabled={isFolderFull}
        aria-label={`${sticker.name} 스티커 추가`}
        onClick={() => addSticker(sticker.stickerId, sticker.imageUrl)}
        className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-[#e4e4e4]"
      >
        <img
          src={sticker.imageUrl}
          alt=""
          loading="lazy"
          className="size-full object-contain p-1"
        />
      </button>
    ));
  };

  return (
    <section className="absolute inset-0 bg-[#f9f9f9]">
      <div className="absolute top-7 left-6 flex w-[342px] gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categoryGroups.map((group) => (
          <button
            key={group.category}
            type="button"
            aria-current={activeCategory === group.category ? 'true' : undefined}
            onClick={() => setSelectedCategory(group.category)}
            className={`shrink-0 rounded-full border px-3 py-[7px] text-[14px] leading-normal ${
              activeCategory === group.category
                ? 'border-[#ff6f41] bg-[#ffebe5] text-[#ff6f41]'
                : 'border-[#e4e4e4] text-[#7f7f7f]'
            }`}
          >
            {STICKER_CATEGORY_LABELS[group.category]}
          </button>
        ))}
      </div>

      <div className="absolute top-[76px] left-1/2 grid w-[344px] -translate-x-1/2 grid-cols-5 gap-4">
        {renderStickerGrid()}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={CUSTOM_STICKER_CONTENT_TYPE}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            selectStickerFile(file);
          }

          event.target.value = '';
        }}
      />

      {isUploadModalOpen ? (
        <div className="absolute -top-[503px] left-0 z-50 h-[844px] w-[390px] bg-black/50">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="나만의 스티커 만들기"
            className="absolute top-1/2 left-6 w-[342px] -translate-y-1/2 rounded-xl bg-[#f9f9f9] p-6 shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
          >
            <button
              type="button"
              aria-label="모달 닫기"
              onClick={closeUploadModal}
              className="absolute top-4 right-4 flex size-6 items-center justify-center"
            >
              <img src={closeRoundedIcon} alt="" className="size-6" />
            </button>
            <h2 className="text-[18px] leading-[1.25] font-semibold text-[#1c1c1c]">
              나만의 스티커를
              <br />
              만들어 보세요
            </h2>
            <p className="mt-1 text-[14px] text-[#1c1c1c]">
              사진에서 복사한 피사체를 붙여넣어 보세요!
            </p>
            {pendingFile ? (
              <div className="mt-5 flex h-[213px] w-full items-center justify-center">
                {/* 폴더에 붙었을 때와 같은 흰 테두리로 보여준다. */}
                <UploadedStickerImage
                  imageFile={pendingFile}
                  className="size-[150px]"
                  imageClassName={CUSTOM_STICKER_OUTLINE_CLASS}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 flex h-[213px] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#ff6f41] bg-[#fff7f5]"
              >
                <span className="flex size-[51px] items-center justify-center rounded-full bg-[#fbd0c2]">
                  <img src={photoUploadIcon} alt="" className="size-8" />
                </span>
                <span className="text-center text-[14px] font-semibold text-[#1c1c1c]">
                  사진을 붙여넣거나 추가해 주세요.
                </span>
                <span className="text-[12px] text-[#1c1c1c]">
                  여기를 탭해서 업로드할 수 있어요.
                </span>
              </button>
            )}
            <button
              type="button"
              disabled={!pendingFile || isSavingCustomSticker}
              aria-busy={isSavingCustomSticker}
              onClick={() => void handleCreateCustomSticker()}
              className="mt-5 h-12 w-full rounded-xl bg-[#ff6f41] text-[16px] font-semibold text-[#f9f9f9] disabled:bg-[#e4e4e4] disabled:text-[#7f7f7f]"
            >
              {isSavingCustomSticker ? '등록하는 중이에요' : '스티커 추가하기'}
            </button>
          </section>
        </div>
      ) : null}
    </section>
  );
}
