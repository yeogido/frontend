import { useRef, useState } from 'react';

import { UploadedStickerImage } from '../../../../components/sticker';
import { useToast } from '../../../../components/toast';
import addRoundedIcon from '../../../../assets/icons/material-symbols_add-2-rounded.svg';
import closeRoundedIcon from '../../../../assets/icons/close-rounded.svg';
import photoUploadIcon from '../../photo-selection/assets/photo-upload-icon.svg';
import {
  getUploadStickerSlotState,
  MAX_FOLDER_DECORATION_COUNT,
  type TravelFolderDecoration,
  type UploadedFolderSticker,
  validateFolderDecorationFiles,
} from '../folderDecoration';
import { STICKERS_BY_CATEGORY, type StickerCategory } from '../stickers';

const categories: Array<{ id: StickerCategory | 'create'; label: string }> = [
  { id: 'food', label: '\uC74C\uC2DD' },
  { id: 'nature', label: '\uC790\uC5F0' },
  { id: 'animal', label: '\uB3D9\uBB3C' },
  { id: 'person', label: '\uC778\uBB3C' },
  { id: 'object', label: '\uC0AC\uBB3C' },
  { id: 'create', label: '\uB9CC\uB4E4\uAE30' },
];

interface FolderDecorationPaletteProps {
  decorations: TravelFolderDecoration[];
  onAddSticker: (stickerId: string) => void;
  uploadedStickers: UploadedFolderSticker[];
  onAddUpload: (file: File) => void;
  onAddUploadedSticker: (uploadedStickerId: string) => void;
  onDeleteUploadedSticker: (uploadedStickerId: string) => void;
  onLimitReached: () => void;
}

export function FolderDecorationPalette({
  decorations,
  onAddSticker,
  uploadedStickers,
  onAddUpload,
  onAddUploadedSticker,
  onDeleteUploadedSticker,
  onLimitReached,
}: FolderDecorationPaletteProps) {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<StickerCategory | 'create'>('food');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFull = decorations.length >= MAX_FOLDER_DECORATION_COUNT;
  const uploadStickerSlotState = getUploadStickerSlotState(
    uploadedStickers.length,
  );
  const stickers = activeCategory === 'create' ? [] : STICKERS_BY_CATEGORY[activeCategory];

  return (
    <section className="absolute inset-0 bg-[#f9f9f9]">
      <div className="absolute top-7 left-6 flex w-[342px] gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            className={`shrink-0 rounded-full border px-3 py-[7px] text-[14px] leading-normal ${
              activeCategory === category.id
                ? 'border-[#ff6f41] bg-[#ffebe5] text-[#ff6f41]'
                : 'border-[#e4e4e4] text-[#7f7f7f]'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="absolute top-[76px] left-1/2 grid w-[344px] -translate-x-1/2 grid-cols-5 gap-4">
        {activeCategory === 'create' ? (
          <>
            {uploadedStickers.map((sticker) => (
              <div key={sticker.id} className="relative size-14">
                <button
                  type="button"
                  aria-label="업로드 스티커 추가"
                  onClick={() =>
                    isFull
                      ? onLimitReached()
                      : onAddUploadedSticker(sticker.id)
                  }
                  className="size-full"
                >
                  <UploadedStickerImage
                    imageFile={sticker.imageFile}
                    className="size-full"
                    imageClassName="object-cover"
                  />
                </button>
                <button
                  type="button"
                  aria-label="업로드 스티커 삭제"
                  onClick={() => onDeleteUploadedSticker(sticker.id)}
                  className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full bg-[#f9f9f9] shadow-[0_2px_8px_rgba(0,0,0,0.16)]"
                >
                  <img src={closeRoundedIcon} alt="" className="size-4" />
                </button>
              </div>
            ))}
            {uploadStickerSlotState.canAdd ? (
              <button
                type="button"
                aria-label="\uC774\uBBF8\uC9C0 \uCD94\uAC00"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex size-14 items-center justify-center rounded-xl bg-[#e4e4e4]"
              >
                <img src={addRoundedIcon} alt="" className="size-8" />
              </button>
            ) : null}
            {Array.from({ length: uploadStickerSlotState.emptySlotCount }).map((_, index) => (
              <div key={`empty-upload-slot-${index}`} className="size-14 rounded-xl bg-[#e4e4e4]" />
            ))}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const result = validateFolderDecorationFiles(
                  Array.from(event.target.files ?? []),
                  Math.min(
                    MAX_FOLDER_DECORATION_COUNT - decorations.length,
                    MAX_FOLDER_DECORATION_COUNT - uploadedStickers.length,
                  ),
                );
                setPendingFile(result.files[0] ?? null);
                if (result.message) {
                  showToast(result.message);
                }
                event.target.value = '';
              }}
            />
          </>
        ) : (
          stickers.map((sticker) => (
            <button
              key={sticker.id}
              type="button"
              aria-disabled={isFull}
              aria-label={`${sticker.label} \uC2A4\uD2F0\uCEE4 \uCD94\uAC00`}
              onClick={() => (isFull ? onLimitReached() : onAddSticker(sticker.id))}
              className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-[#e4e4e4]"
            >
              <img src={sticker.src} alt="" className="size-full object-contain p-1" />
            </button>
          ))
        )}
      </div>

      {isUploadModalOpen ? (
        <div className="absolute -top-[503px] left-0 z-50 h-[844px] w-[390px] bg-black/50">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="\uB098\uB9CC\uC758 \uC2A4\uD2F0\uCEE4 \uB9CC\uB4E4\uAE30"
            className="absolute top-1/2 left-6 w-[342px] -translate-y-1/2 rounded-xl bg-[#f9f9f9] p-6 shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
          >
            <button
              type="button"
              aria-label="\uBAA8\uB2EC \uB2EB\uAE30"
              onClick={() => {
                setIsUploadModalOpen(false);
                setPendingFile(null);
              }}
              className="absolute top-4 right-4 flex size-6 items-center justify-center"
            >
              <img src={closeRoundedIcon} alt="" className="size-6" />
            </button>
            <h2 className="text-[18px] leading-[1.25] font-semibold text-[#1c1c1c]">
              {'\uB098\uB9CC\uC758 \uC2A4\uD2F0\uCEE4\uB97C'}<br />{'\uB9CC\uB4E4\uC5B4 \uBCF4\uC138\uC694'}
            </h2>
            <p className="mt-1 text-[14px] text-[#1c1c1c]">{'\uC0AC\uC9C4\uC744 \uCD94\uAC00\uD558\uBA74 \uC2A4\uD2F0\uCEE4\uB85C \uB9CC\uB4E4\uC5B4\uB4DC\uB824\uC694!'}</p>
            {pendingFile ? (
              <div className="mt-5 flex h-[213px] w-full items-center justify-center">
                <UploadedStickerImage
                  imageFile={pendingFile}
                  className="size-[150px]"
                  imageClassName="object-cover"
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
                <>
                  <span className="text-center text-[14px] font-semibold text-[#1c1c1c]">
                    {'\uC0AC\uC9C4\uC744 \uCD94\uAC00\uD574 \uC8FC\uC138\uC694.'}
                  </span>
                  <span className="text-[12px] text-[#1c1c1c]">{'\uC5EC\uAE30\uB97C \uD0ED\uD574\uC11C \uC5C5\uB85C\uB4DC\uD560 \uC218 \uC788\uC5B4\uC694.'}</span>
                </>
              </button>
            )}
            <button
              type="button"
              disabled={!pendingFile || isFull}
              onClick={() => {
                if (pendingFile) {
                  onAddUpload(pendingFile);
                }
                setPendingFile(null);
                setIsUploadModalOpen(false);
              }}
              className="mt-5 h-12 w-full rounded-xl bg-[#ff6f41] text-[16px] font-semibold text-[#f9f9f9] disabled:bg-[#e4e4e4] disabled:text-[#7f7f7f]"
            >
              {'\uC2A4\uD2F0\uCEE4 \uCD94\uAC00\uD558\uAE30'}
            </button>
          </section>
        </div>
      ) : null}
    </section>
  );
}
