import assert from 'node:assert/strict';
import test from 'node:test';
import * as folderDecoration from '../src/pages/travel-record/folder-decoration/folderDecoration.ts';

import {
  MAX_FOLDER_DECORATION_COUNT,
  createFolderDecoration,
  getDecorationRotation,
  getNormalizedCanvasPoint,
  validateFolderDecorationFiles,
} from '../src/pages/travel-record/folder-decoration/folderDecoration.ts';
import { normalizeStoredDecorations } from '../src/pages/travel-record/utils/travelRecordSave.ts';
import {
  STICKER_CATEGORIES,
  isKnownStickerId,
} from '../src/pages/travel-record/folder-decoration/stickerCatalog.ts';
import { getDecorationLayerStyle } from '../src/pages/travel-record/components/decorationRender.ts';

const createFile = (type: string, size: number) => ({ type, size }) as File;

test('allows supported image files only until the remaining decoration limit', () => {
  const result = validateFolderDecorationFiles(
    [
      createFile('image/jpeg', 1),
      createFile('image/png', 1),
      createFile('image/webp', 1),
    ],
    2,
  );

  assert.equal(result.files.length, 2);
  assert.match(result.message, /10/);
});

test('rejects unsupported, oversized, and over-limit decoration uploads', () => {
  assert.equal(
    validateFolderDecorationFiles([createFile('image/gif', 1)], 1).files
      .length,
    0,
  );
  assert.equal(
    validateFolderDecorationFiles(
      [createFile('image/png', 10 * 1024 * 1024 + 1)],
      1,
    ).files.length,
    0,
  );
  assert.equal(
    validateFolderDecorationFiles([createFile('image/png', 1)], 0).files
      .length,
    0,
  );
  assert.equal(MAX_FOLDER_DECORATION_COUNT, 10);
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

test('creates new decorations in the canvas center above existing layers', () => {
  const decoration = createFolderDecoration(
    { source: 'sticker', stickerId: 'food-noodle' },
    [{ id: 'existing', zIndex: 4 }],
  );

  assert.equal(decoration.x, 0.5);
  assert.equal(decoration.y, 0.5);
  assert.equal(decoration.rotation, 0);
  assert.equal(decoration.scale, 1);
  assert.equal(decoration.zIndex, 5);
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

test('normalizes records saved before decorations existed', () => {
  assert.deepEqual(normalizeStoredDecorations(undefined), []);
});

test('registers the five Figma sticker categories and known sticker ids', () => {
  assert.deepEqual(STICKER_CATEGORIES, [
    'food',
    'nature',
    'animal',
    'person',
    'object',
  ]);
  assert.equal(isKnownStickerId('food-coffee'), true);
  assert.equal(isKnownStickerId('missing-sticker'), false);
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
