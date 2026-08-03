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

test('rejects a custom sticker file over the size limit', () => {
  assert.match(
    validateCustomStickerFile(createFile('image/png', 10 * 1024 * 1024 + 1)),
    /10MB/,
  );
  assert.equal(MAX_FOLDER_DECORATION_COUNT, 10);
  assert.equal(MAX_CUSTOM_STICKER_COUNT, 10);
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
