import type {
  StickerCategory,
  StickerCategoryGroup,
  StickerListResponse,
  StickerResponse,
} from '../../../types/sticker.type';

// apiClient를 import하지 않는다. 이 파일은 순수 함수만 담아 Node 테스트
// 러너에서 그대로 불러올 수 있어야 한다.

export const STICKER_CATEGORY_LABELS: Record<StickerCategory, string> = {
  NATURE: '자연',
  FOOD: '음식',
  ANIMAL: '동물',
  PERSON: '인물',
  OBJECT: '사물',
  CUSTOM: '만들기',
};

const CUSTOM_CATEGORY: StickerCategory = 'CUSTOM';

export const getStickerCategoryGroups = (
  catalog: StickerListResponse | undefined,
): StickerCategoryGroup[] => catalog?.categories ?? [];

export const getCustomStickers = (
  catalog: StickerListResponse | undefined,
): StickerResponse[] =>
  getStickerCategoryGroups(catalog).find(
    (group) => group.category === CUSTOM_CATEGORY,
  )?.stickers ?? [];

/**
 * 등록 응답으로 받은 커스텀 스티커를 카탈로그에 이어 붙인다.
 *
 * 등록 API가 스티커 전체를 돌려주므로 목록을 다시 받아올 때까지 기다리지 않고
 * 팔레트에 바로 반영한다. 서버는 커스텀 스티커를 등록 순서로 내려주므로
 * 맨 뒤에 붙인다.
 */
export const appendCustomSticker = (
  catalog: StickerListResponse,
  sticker: StickerResponse,
): StickerListResponse => {
  const hasCustomCategory = catalog.categories.some(
    (group) => group.category === CUSTOM_CATEGORY,
  );

  if (!hasCustomCategory) {
    return {
      categories: [
        ...catalog.categories,
        { category: CUSTOM_CATEGORY, stickers: [sticker] },
      ],
    };
  }

  return {
    categories: catalog.categories.map((group) =>
      group.category === CUSTOM_CATEGORY
        ? { ...group, stickers: [...group.stickers, sticker] }
        : group,
    ),
  };
};

export const removeCustomSticker = (
  catalog: StickerListResponse,
  stickerId: number,
): StickerListResponse => ({
  categories: catalog.categories.map((group) =>
    group.category === CUSTOM_CATEGORY
      ? {
          ...group,
          stickers: group.stickers.filter(
            (sticker) => sticker.stickerId !== stickerId,
          ),
        }
      : group,
  ),
});
