import assert from 'node:assert/strict';
import test from 'node:test';
import * as folderDecoration from '../src/pages/travel-record/folder-decoration/folderDecoration.ts';

import {
  MAX_CUSTOM_STICKER_COUNT,
  MAX_FOLDER_DECORATION_COUNT,
  appendFolderDecoration,
  createFolderDecoration,
  getCustomStickerSlotState,
  getDecorationRotation,
  getNormalizedCanvasPoint,
  getPastedStickerImage,
  isCustomStickerImage,
  readStickerImageFromClipboard,
  validateCustomStickerFile,
} from '../src/pages/travel-record/folder-decoration/folderDecoration.ts';
import { getDecorationLayerStyle } from '../src/pages/travel-record/components/decorationRender.ts';

const createFile = (type: string, size: number) => ({ type, size }) as File;

const createClipboardItem = (
  kind: string,
  type: string,
  file: File | null,
) => ({ kind, type, getAsFile: () => file });

test('accepts only transparent-capable PNG files as custom stickers', () => {
  assert.equal(validateCustomStickerFile(createFile('image/png', 1)), '');
  // JPEG는 투명도를 담지 못해 변환해도 흰 사각형이 된다.
  assert.match(
    validateCustomStickerFile(createFile('image/jpeg', 1)),
    /PNG/,
  );
  assert.match(
    validateCustomStickerFile(createFile('image/webp', 1)),
    /PNG/,
  );
});

test('accepts a PNG custom sticker regardless of file size', () => {
  assert.equal(
    validateCustomStickerFile(createFile('image/png', 10 * 1024 * 1024 + 1)),
    '',
  );
  assert.equal(MAX_FOLDER_DECORATION_COUNT, 10);
  assert.equal(MAX_CUSTOM_STICKER_COUNT, 10);
});

test('tells custom stickers apart from default ones by image path', () => {
  // 여행 기록 상세 응답에는 stickerType이 없어 경로로 구분한다.
  const base = 'https://example.com';

  assert.equal(
    isCustomStickerImage(`${base}/stickers/default/nature/sun.png`),
    false,
  );
  assert.equal(
    isCustomStickerImage(`${base}/stickers/default/food/cake.png`),
    false,
  );
  assert.equal(
    isCustomStickerImage(
      `${base}/stickers/230c1263-630a-407b-9603-7cc8e231f911.png`,
    ),
    true,
  );
  assert.equal(isCustomStickerImage(''), false);
});

test('reads a copied PNG through the clipboard API', async () => {
  // 모바일에는 Ctrl+V가 없어 paste 이벤트 대신 이 경로로 받는다.
  const clipboard = {
    read: async () => [
      { types: ['text/plain'], getType: async () => new Blob(['x']) },
      {
        types: ['image/png'],
        getType: async (type: string) => new Blob(['sticker'], { type }),
      },
    ],
  };

  const image = await readStickerImageFromClipboard(clipboard);

  assert.equal(image?.type, 'image/png');
  assert.equal(image?.name, 'custom-sticker.png');
});

test('returns nothing when the clipboard holds no PNG', async () => {
  const clipboard = {
    read: async () => [
      { types: ['text/plain'], getType: async () => new Blob(['x']) },
      { types: ['image/jpeg'], getType: async () => new Blob(['x']) },
    ],
  };

  assert.equal(await readStickerImageFromClipboard(clipboard), null);
});

test('picks the first pasted PNG image out of the clipboard', () => {
  const pngFile = createFile('image/png', 1);

  assert.equal(
    getPastedStickerImage([
      createClipboardItem('string', 'text/plain', null),
      createClipboardItem('file', 'image/jpeg', createFile('image/jpeg', 1)),
      createClipboardItem('file', 'image/png', pngFile),
    ]),
    pngFile,
  );
  assert.equal(
    getPastedStickerImage([
      createClipboardItem('file', 'image/png', null),
      createClipboardItem('string', 'text/html', null),
    ]),
    null,
  );
});

test('clamps pointer coordinates to the folder canvas', () => {
  assert.deepEqual(
    getNormalizedCanvasPoint(
      { left: 10, top: 20, width: 200, height: 100 },
      310,
      -20,
    ),
    { x: 1, y: 0 },
  );
});

test('clamps pointer coordinates to the visible folder face bounds', () => {
  assert.deepEqual(
    getNormalizedCanvasPoint(
      { left: 0, top: 0, width: 159, height: 183 },
      0,
      0,
      { minX: 0.03, maxX: 0.97, minY: 53 / 183, maxY: 1 },
    ),
    { x: 0.03, y: 53 / 183 },
  );
});

test('defines the combined folder and photo area as the decoration movement bounds', () => {
  const folderDecorationCanvasBounds = (
    folderDecoration as {
      FOLDER_DECORATION_CANVAS_BOUNDS?: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
      };
    }
  ).FOLDER_DECORATION_CANVAS_BOUNDS;

  assert.deepEqual(folderDecorationCanvasBounds, {
    minX: -3 / 159,
    maxX: 162 / 159,
    minY: 0,
    maxY: 1,
  });
});

test('allows a decoration center to reach the full folder and photo layout bounds', () => {
  const getDecorationDragPoint = (
    folderDecoration as {
      getDecorationDragPoint?: (
        rect: { left: number; top: number; width: number; height: number },
        clientX: number,
        clientY: number,
      ) => { x: number; y: number };
    }
  ).getDecorationDragPoint;

  assert.equal(typeof getDecorationDragPoint, 'function');
  if (!getDecorationDragPoint) return;

  assert.deepEqual(
    getDecorationDragPoint(
      { left: 0, top: 0, width: 159, height: 183 },
      300,
      300,
    ),
    {
      x: 162 / 159,
      y: 1,
    },
  );
});

test('accepts drag positions only inside the folder or either photo frame', () => {
  const isPointInFolderDecorationLayout = (
    folderDecoration as {
      isPointInFolderDecorationLayout?: (point: {
        x: number;
        y: number;
      }) => boolean;
    }
  ).isPointInFolderDecorationLayout;

  assert.equal(typeof isPointInFolderDecorationLayout, 'function');
  if (!isPointInFolderDecorationLayout) return;

  assert.equal(isPointInFolderDecorationLayout({ x: 0.5, y: 0.75 }), true);
  assert.equal(isPointInFolderDecorationLayout({ x: 0.31, y: 0.2 }), true);
  assert.equal(isPointInFolderDecorationLayout({ x: 1, y: 0 }), false);
});

test('follows the single photo slot instead of the two photo slots', () => {
  const { isPointInFolderDecorationLayout } =
    folderDecoration as typeof import('../src/pages/travel-record/folder-decoration/folderDecoration');

  // 사진 한 장은 전용 슬롯(중심 y 80.3375)을 쓴다. 두 장일 때의 오른쪽
  // 슬롯(중심 y 72.3375)보다 8px 내려가 있어 위아래 경계가 서로 다르다.
  const aboveSingleSlot = { x: 108.3375 / 159, y: 30 / 183 };
  const belowSingleSlot = { x: 108.3375 / 159, y: 122 / 183 };

  // 두 장 기준으로는 사진 위쪽이 열려 있지만, 한 장일 때는 사진이 더
  // 내려와 있어 같은 지점이 폴더 밖이다.
  assert.equal(isPointInFolderDecorationLayout(aboveSingleSlot, [1, 0]), true);
  assert.equal(isPointInFolderDecorationLayout(aboveSingleSlot, [2]), false);

  // 반대로 아래쪽은 한 장일 때만 사진에 걸린다.
  assert.equal(isPointInFolderDecorationLayout(belowSingleSlot, [2]), true);
});

test('closes the empty left photo slot when only one photo is placed', () => {
  const { isPointInFolderDecorationLayout } =
    folderDecoration as typeof import('../src/pages/travel-record/folder-decoration/folderDecoration');

  // 왼쪽 슬롯 자리. 사진이 한 장이면 그 자리에 사진이 없으므로 스티커도
  // 갈 수 없어야 한다.
  const leftPhotoSlot = { x: 0.31, y: 0.2 };

  assert.equal(isPointInFolderDecorationLayout(leftPhotoSlot, [1, 0]), true);
  assert.equal(isPointInFolderDecorationLayout(leftPhotoSlot, [2]), false);
});

test('keeps the folder front open regardless of how many photos there are', () => {
  const { isPointInFolderDecorationLayout } =
    folderDecoration as typeof import('../src/pages/travel-record/folder-decoration/folderDecoration');

  const folderFront = { x: 0.5, y: 0.75 };

  assert.equal(isPointInFolderDecorationLayout(folderFront, [1, 0]), true);
  assert.equal(isPointInFolderDecorationLayout(folderFront, [2]), true);
  assert.equal(isPointInFolderDecorationLayout({ x: 1, y: 0 }, [2]), false);
});

test('reuses one photo frame table for the clip path and the drag bounds', () => {
  const { FOLDER_PHOTO_FRAMES } =
    folderDecoration as typeof import('../src/pages/travel-record/folder-decoration/folderDecoration');

  // 슬롯 인덱스는 TravelFolderCard의 folderPhotoSlots와 같은 순서여야 한다.
  // 두 표가 어긋나면 스티커가 놓이는 자리와 그려지는 자리가 달라진다.
  assert.equal(FOLDER_PHOTO_FRAMES.length, 3);
  assert.deepEqual(FOLDER_PHOTO_FRAMES[0], {
    centerX: 49.1865,
    centerY: 52.1865,
    width: 88,
    height: 88,
    radius: 12,
    rotation: -12,
  });
  assert.deepEqual(FOLDER_PHOTO_FRAMES[2], {
    centerX: 108.3375,
    centerY: 80.3375,
    width: 88,
    height: 88,
    radius: 12,
    rotation: 14,
  });
});

test('rejects a dropped sticker outside the folder without clamping it to the edge', () => {
  const isFolderDecorationDropTarget = (
    folderDecoration as typeof import('../src/pages/travel-record/folder-decoration/folderDecoration')
  ).isFolderDecorationDropTarget;

  assert.equal(typeof isFolderDecorationDropTarget, 'function');
  if (!isFolderDecorationDropTarget) return;

  const canvasRect = { left: 0, top: 0, width: 159, height: 183 };

  assert.equal(isFolderDecorationDropTarget(canvasRect, 79.5, 137), true);
  assert.equal(isFolderDecorationDropTarget(canvasRect, 79.5, 220), false);
});

test('creates new decorations in the canvas center above existing layers', () => {
  const decoration = createFolderDecoration(
    { stickerId: 11, imageUrl: 'https://example.com/stickers/sun.png' },
    [{ id: 'existing', zIndex: 4 }],
  );

  assert.equal(decoration.stickerId, 11);
  assert.equal(decoration.imageUrl, 'https://example.com/stickers/sun.png');
  assert.equal(decoration.x, 0.5);
  assert.equal(decoration.y, 0.5);
  assert.equal(decoration.rotation, 0);
  assert.equal(decoration.scale, 1);
  assert.equal(decoration.zIndex, 5);
});

test('drops a sticker where the pointer was released', () => {
  // 목록에서 끌어다 놓으면 손을 뗀 자리에 붙는다.
  const dropPoint = { x: 0.2, y: 0.8 };
  const decoration = createFolderDecoration(
    { stickerId: 11, imageUrl: 'https://example.com/sun.png' },
    [],
    dropPoint,
  );

  assert.equal(decoration.x, 0.2);
  assert.equal(decoration.y, 0.8);
});

test('appends a dropped sticker at the given point', () => {
  const result = appendFolderDecoration(
    [],
    { stickerId: 11, imageUrl: 'https://example.com/sun.png' },
    { x: 0.1, y: 0.9 },
  );

  assert.equal(result.added, true);
  assert.deepEqual(
    { x: result.decorations[0].x, y: result.decorations[0].y },
    { x: 0.1, y: 0.9 },
  );
});

test('does not append a sticker when its pointer interaction is cancelled', () => {
  const shouldAppendFolderDecorationAfterDrag = (
    folderDecoration as typeof import('../src/pages/travel-record/folder-decoration/folderDecoration')
  ).shouldAppendFolderDecorationAfterDrag;

  assert.equal(typeof shouldAppendFolderDecorationAfterDrag, 'function');
  if (!shouldAppendFolderDecorationAfterDrag) return;

  assert.equal(
    shouldAppendFolderDecorationAfterDrag({
      isCancelled: true,
      movedDistance: 0,
      isDropTarget: true,
    }),
    false,
  );
});

test('positions the dragged sticker preview from viewport pointer coordinates', () => {
  const getDraggingStickerPreviewStyle = (
    folderDecoration as typeof import('../src/pages/travel-record/folder-decoration/folderDecoration')
  ).getDraggingStickerPreviewStyle;

  assert.equal(typeof getDraggingStickerPreviewStyle, 'function');
  if (!getDraggingStickerPreviewStyle) return;

  assert.deepEqual(
    getDraggingStickerPreviewStyle({ x: 218, y: 391 }, 0.8),
    {
      left: 218,
      top: 391,
      transform: 'translate(-50%, -50%) scale(0.8)',
    },
  );
});

test('ignores pointer events from a different sticker drag', () => {
  const isActiveStickerDragPointer = (
    folderDecoration as typeof import('../src/pages/travel-record/folder-decoration/folderDecoration')
  ).isActiveStickerDragPointer;

  assert.equal(typeof isActiveStickerDragPointer, 'function');
  if (!isActiveStickerDragPointer) return;

  assert.equal(isActiveStickerDragPointer(12, 12), true);
  assert.equal(isActiveStickerDragPointer(12, 13), false);
});

test('keeps the decoration count at ten when an additional sticker is requested', () => {
  const decorations = Array.from({ length: MAX_FOLDER_DECORATION_COUNT }, (_, index) =>
    createFolderDecoration(
      { stickerId: index + 1, imageUrl: `https://example.com/${index}.png` },
      [],
    ),
  );

  const result = appendFolderDecoration(decorations, {
    stickerId: 50,
    imageUrl: 'https://example.com/extra.png',
  });

  assert.equal(result.added, false);
  assert.equal(result.decorations, decorations);
});

test('hides the custom sticker add slot once the hold limit is reached', () => {
  assert.deepEqual(getCustomStickerSlotState(MAX_CUSTOM_STICKER_COUNT), {
    canAdd: false,
    emptySlotCount: 0,
  });
  // 폴더에 몇 개를 배치했는지는 보유 한도와 무관하다.
  assert.deepEqual(getCustomStickerSlotState(2), {
    canAdd: true,
    emptySlotCount: MAX_CUSTOM_STICKER_COUNT - 3,
  });
});

test('moves a selected decoration above every other decoration', () => {
  const bringDecorationToFront = (
    folderDecoration as {
      bringDecorationToFront?: <T extends { id: string; zIndex: number }>(
        decorations: T[],
        id: string,
      ) => T[];
    }
  ).bringDecorationToFront;

  assert.equal(typeof bringDecorationToFront, 'function');
  if (!bringDecorationToFront) return;

  assert.deepEqual(
    bringDecorationToFront(
      [
        { id: 'first', zIndex: 1 },
        { id: 'selected', zIndex: 2 },
        { id: 'last', zIndex: 4 },
      ],
      'selected',
    ),
    [
      { id: 'first', zIndex: 1 },
      { id: 'selected', zIndex: 5 },
      { id: 'last', zIndex: 4 },
    ],
  );
});

test('calculates rotation from the decoration center to the pointer', () => {
  assert.equal(
    getDecorationRotation({ x: 0, y: -10 }, { x: 10, y: -10 }),
    90,
  );
});

test('changes a decoration scale within the supported editor range', () => {
  const getDecorationScale = (
    folderDecoration as {
      getDecorationScale?: (scale: number, difference: number) => number;
    }
  ).getDecorationScale;

  assert.equal(typeof getDecorationScale, 'function');
  if (!getDecorationScale) return;

  assert.equal(getDecorationScale(1, 0.1), 1.1);
  assert.equal(getDecorationScale(0.5, -0.1), 0.5);
  assert.equal(getDecorationScale(3, 0.1), 3);
});

test('keeps the rotation unchanged until the rotate handle moves', () => {
  const getDecorationRotationFromPointerDelta = (
    folderDecoration as {
      getDecorationRotationFromPointerDelta?: (
        rotation: number,
        center: { x: number; y: number },
        initialPointer: { x: number; y: number },
        currentPointer: { x: number; y: number },
      ) => number;
    }
  ).getDecorationRotationFromPointerDelta;

  assert.equal(typeof getDecorationRotationFromPointerDelta, 'function');
  if (!getDecorationRotationFromPointerDelta) return;

  assert.equal(
    getDecorationRotationFromPointerDelta(
      30,
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 0, y: 10 },
    ),
    30,
  );
  assert.equal(
    getDecorationRotationFromPointerDelta(
      30,
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 10, y: 0 },
    ),
    -60,
  );
});

test('scales a decoration by the diagonal resize drag distance', () => {
  const getDecorationScaleFromPointerDistance = (
    folderDecoration as {
      getDecorationScaleFromPointerDistance?: (
        scale: number,
        center: { x: number; y: number },
        initialPointer: { x: number; y: number },
        currentPointer: { x: number; y: number },
      ) => number;
    }
  ).getDecorationScaleFromPointerDistance;

  assert.equal(typeof getDecorationScaleFromPointerDistance, 'function');
  if (!getDecorationScaleFromPointerDistance) return;

  assert.equal(
    getDecorationScaleFromPointerDistance(
      1,
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 30, y: 30 },
    ),
    3,
  );
  assert.equal(
    getDecorationScaleFromPointerDistance(
      1,
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 1, y: 1 },
    ),
    0.5,
  );
});

test('converts saved decoration geometry to a renderer style', () => {
  assert.deepEqual(
    getDecorationLayerStyle({ x: 0.25, y: 0.75, rotation: -18, scale: 1.2, zIndex: 7 }),
    {
      left: '25%',
      top: '75%',
      transform: 'translate(-50%, -50%) rotate(-18deg) scale(1.2)',
      zIndex: 7,
    },
  );
});

test('keeps an editor decoration layer above the rendered folder artwork', () => {
  assert.equal(
    getDecorationLayerStyle(
      { x: 0.5, y: 0.5, rotation: 0, scale: 1, zIndex: 3 },
      70,
    ).zIndex,
    73,
  );
});
