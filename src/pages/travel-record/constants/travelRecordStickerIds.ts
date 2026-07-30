import { STICKER_IDS } from '../folder-decoration/stickerCatalog.ts';

export const FRONTEND_STICKER_ID_TO_BACKEND_ID = Object.fromEntries(
  STICKER_IDS.map((stickerId, index) => [stickerId, index + 1]),
) as Record<string, number>;

export const BACKEND_STICKER_ID_TO_FRONTEND_ID = Object.fromEntries(
  STICKER_IDS.map((stickerId, index) => [index + 1, stickerId]),
) as Record<number, string>;
