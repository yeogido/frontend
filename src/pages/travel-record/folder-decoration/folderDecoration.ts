export type TravelFolderDecorationSource = 'sticker' | 'upload';

export interface TravelFolderDecoration {
  id: string;
  source: TravelFolderDecorationSource;
  stickerId?: string;
  imageFile?: File;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export interface FolderDecorationSeed {
  source: TravelFolderDecorationSource;
  stickerId?: string;
  imageFile?: File;
}

export interface FolderDecorationLayer {
  id: string;
  zIndex: number;
}

export interface CanvasRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CanvasBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface FolderDecorationFileValidationResult {
  files: File[];
  message: string;
}

export const MAX_FOLDER_DECORATION_COUNT = 10;
export const MAX_FOLDER_DECORATION_FILE_SIZE = 10 * 1024 * 1024;

const acceptedFileTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const createDecorationId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `decoration-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export const validateFolderDecorationFiles = (
  selectedFiles: File[],
  remainingCount: number,
): FolderDecorationFileValidationResult => {
  if (remainingCount <= 0) {
    return {
      files: [],
      message: '\uC2A4\uD2F0\uCEE4\uB294 \uCD5C\uB300 10\uAC1C\uAE4C\uC9C0 \uB4F1\uB85D\uD560 \uC218 \uC788\uC5B4\uC694.',
    };
  }

  const supportedFiles = selectedFiles.filter((file) =>
    acceptedFileTypes.has(file.type),
  );
  const sizeValidFiles = supportedFiles.filter(
    (file) => file.size <= MAX_FOLDER_DECORATION_FILE_SIZE,
  );
  const files = sizeValidFiles.slice(0, remainingCount);

  if (supportedFiles.length !== selectedFiles.length) {
    return {
      files,
      message: 'JPEG, PNG, WebP \uC774\uBBF8\uC9C0\uB9CC \uCD94\uAC00\uD560 \uC218 \uC788\uC5B4\uC694.',
    };
  }

  if (sizeValidFiles.length !== supportedFiles.length) {
    return {
      files,
      message: '\uD30C\uC77C \uD558\uB098\uB2F9 10MB \uC774\uD558\uC758 \uC774\uBBF8\uC9C0\uB9CC \uCD94\uAC00\uD560 \uC218 \uC788\uC5B4\uC694.',
    };
  }

  if (sizeValidFiles.length > remainingCount) {
    return {
      files,
      message: '\uC2A4\uD2F0\uCEE4\uB294 \uCD5C\uB300 10\uAC1C\uAE4C\uC9C0 \uB4F1\uB85D\uD560 \uC218 \uC788\uC5B4\uC694.',
    };
  }

  return { files, message: '' };
};

export const getNormalizedCanvasPoint = (
  rect: CanvasRect,
  clientX: number,
  clientY: number,
  bounds: CanvasBounds = { minX: 0, maxX: 1, minY: 0, maxY: 1 },
) => ({
  x: clamp((clientX - rect.left) / rect.width, bounds.minX, bounds.maxX),
  y: clamp((clientY - rect.top) / rect.height, bounds.minY, bounds.maxY),
});

export const getDecorationRotation = (
  center: { x: number; y: number },
  point: { x: number; y: number },
) =>
  Math.round(
    (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI + 90,
  );

const getPointerDistance = (
  center: { x: number; y: number },
  pointer: { x: number; y: number },
) => Math.hypot(pointer.x - center.x, pointer.y - center.y);

const normalizeRotationDifference = (rotation: number) =>
  ((rotation + 180) % 360 + 360) % 360 - 180;

export const getDecorationRotationFromPointerDelta = (
  initialRotation: number,
  center: { x: number; y: number },
  initialPointer: { x: number; y: number },
  currentPointer: { x: number; y: number },
) =>
  Math.round(
    initialRotation +
      normalizeRotationDifference(
        getDecorationRotation(center, currentPointer) -
          getDecorationRotation(center, initialPointer),
      ),
  );

export const getDecorationScale = (scale: number, difference: number) =>
  Number(clamp(scale + difference, 0.5, 3).toFixed(1));

export const getDecorationScaleFromPointerDistance = (
  initialScale: number,
  center: { x: number; y: number },
  initialPointer: { x: number; y: number },
  currentPointer: { x: number; y: number },
) => {
  const initialDistance = getPointerDistance(center, initialPointer);

  if (initialDistance === 0) return initialScale;

  return Number(
    clamp(
      initialScale * (getPointerDistance(center, currentPointer) / initialDistance),
      0.5,
      3,
    ).toFixed(2),
  );
};

export const bringDecorationToFront = <T extends FolderDecorationLayer>(
  decorations: T[],
  id: string,
): T[] => {
  const topLayer = Math.max(0, ...decorations.map((decoration) => decoration.zIndex));

  return decorations.map((decoration) =>
    decoration.id === id ? { ...decoration, zIndex: topLayer + 1 } : decoration,
  );
};

export const createFolderDecoration = (
  seed: FolderDecorationSeed,
  decorations: FolderDecorationLayer[],
): TravelFolderDecoration => ({
  id: createDecorationId(),
  source: seed.source,
  stickerId: seed.stickerId,
  imageFile: seed.imageFile,
  x: 0.5,
  y: 0.5,
  rotation: 0,
  scale: 1,
  zIndex: Math.max(0, ...decorations.map((decoration) => decoration.zIndex)) + 1,
});
