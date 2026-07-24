import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const placePagePath = new URL(
  '../src/pages/local-recommendation/place-selection/index.tsx',
  import.meta.url
);
const photoModalPath = new URL(
  '../src/pages/local-recommendation/place-selection/components/PlacePhotoModal.tsx',
  import.meta.url
);
const placeTypesPath = new URL(
  '../src/pages/local-recommendation/place-selection/types.ts',
  import.meta.url
);

test('place add opens the photo modal without mutating selected places', () => {
  const source = readFileSync(placePagePath, 'utf8');

  assert.match(
    source,
    /const \[selectedPlaces, setSelectedPlaces\] = useState<SelectedPlace\[\]>\(\[\]\)/
  );
  assert.match(source, /setPendingPlace\(place\)/);
  assert.match(source, /setIsImageModalOpen\(true\)/);
  assert.match(source, /setSelectedPlaces\(\(items\) => \[\s+\.\.\.items,/);
});

test('photo modal provides a preview upload flow and disables confirmation without one', () => {
  assert.ok(existsSync(photoModalPath));

  const source = readFileSync(photoModalPath, 'utf8');

  assert.match(source, /type="file"/);
  assert.match(source, /accept="image\/\*"/);
  assert.match(source, /disabled=\{!previewUrl\}/);
  assert.match(source, /z-\[10000\]/);
  assert.match(source, /사진 추가하기/);
});

test('selected places keep their confirmed image file and preview URL', () => {
  const source = readFileSync(placeTypesPath, 'utf8');

  assert.match(source, /export interface SelectedPlace extends PlaceItem/);
  assert.match(source, /imageFile: File/);
  assert.match(source, /imagePreviewUrl: string/);
});
