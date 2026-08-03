import assert from 'node:assert/strict';
import test from 'node:test';

import {
  appendCustomSticker,
  getCustomStickers,
  removeCustomSticker,
  STICKER_CATEGORY_LABELS,
} from '../src/pages/travel-record/folder-decoration/stickerCatalog.ts';

import type {
  StickerListResponse,
  StickerResponse,
} from '../src/types/sticker.type.ts';

const sun: StickerResponse = {
  stickerId: 11,
  name: '해',
  imageUrl: 'https://example.com/stickers/default/nature/sun.png',
  stickerType: 'DEFAULT',
};

const myFirstSticker: StickerResponse = {
  stickerId: 51,
  name: '나만의 스티커 51',
  imageUrl: 'https://example.com/stickers/custom/1/first.png',
  stickerType: 'CUSTOM',
};

const mySecondSticker: StickerResponse = {
  stickerId: 52,
  name: '나만의 스티커 52',
  imageUrl: 'https://example.com/stickers/custom/1/second.png',
  stickerType: 'CUSTOM',
};

const createCatalog = (): StickerListResponse => ({
  categories: [
    { category: 'NATURE', stickers: [sun] },
    { category: 'CUSTOM', stickers: [myFirstSticker] },
  ],
});

test('labels every sticker category the server can return', () => {
  assert.deepEqual(STICKER_CATEGORY_LABELS, {
    NATURE: '자연',
    FOOD: '음식',
    ANIMAL: '동물',
    PERSON: '인물',
    OBJECT: '사물',
    CUSTOM: '만들기',
  });
});

test('reads custom stickers out of the catalog', () => {
  assert.deepEqual(getCustomStickers(createCatalog()), [myFirstSticker]);
  assert.deepEqual(getCustomStickers(undefined), []);
  assert.deepEqual(
    getCustomStickers({ categories: [{ category: 'NATURE', stickers: [sun] }] }),
    [],
  );
});

test('appends a newly registered sticker after the existing custom ones', () => {
  const catalog = createCatalog();
  const next = appendCustomSticker(catalog, mySecondSticker);

  assert.deepEqual(getCustomStickers(next), [myFirstSticker, mySecondSticker]);
  // 다른 카테고리와 원본 카탈로그는 건드리지 않는다.
  assert.deepEqual(next.categories[0], { category: 'NATURE', stickers: [sun] });
  assert.deepEqual(getCustomStickers(catalog), [myFirstSticker]);
});

test('creates the custom category when the catalog has none yet', () => {
  const next = appendCustomSticker(
    { categories: [{ category: 'NATURE', stickers: [sun] }] },
    myFirstSticker,
  );

  assert.deepEqual(getCustomStickers(next), [myFirstSticker]);
});

test('removes a deleted custom sticker from the catalog', () => {
  const catalog = appendCustomSticker(createCatalog(), mySecondSticker);

  assert.deepEqual(getCustomStickers(removeCustomSticker(catalog, 51)), [
    mySecondSticker,
  ]);
  assert.deepEqual(
    removeCustomSticker(catalog, 51).categories[0],
    { category: 'NATURE', stickers: [sun] },
  );
});
