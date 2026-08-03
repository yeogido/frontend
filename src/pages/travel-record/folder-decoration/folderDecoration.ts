import type { CSSProperties } from 'react';

export interface TravelFolderDecoration {
  id: string;
  /** 서버 스티커 ID. 기본 스티커와 커스텀 스티커를 구분 없이 같은 값으로 다룬다. */
  stickerId: number;
  /**
   * 서버가 내려준 렌더링용 이미지 URL.
   *
   * 카탈로그를 뒤져 찾지 않고 이 값으로 바로 그린다. 논리 삭제된 커스텀
   * 스티커는 카탈로그에 없지만 여행 기록 상세에는 계속 내려오기 때문에,
   * 카탈로그 조회 방식으로는 기존 기록을 그릴 수 없다.
   */
  imageUrl: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export interface FolderDecorationSeed {
  stickerId: number;
  imageUrl: string;
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

export const FOLDER_DECORATION_CANVAS_BOUNDS: CanvasBounds = {
  minX: -3 / 159,
  maxX: 162 / 159,
  minY: 0,
  maxY: 1,
};

const FOLDER_ARTWORK_WIDTH = 159;
const FOLDER_ARTWORK_HEIGHT = 183;

const isPointInRoundedRectangle = (
  point: { x: number; y: number },
  rectangle: {
    centerX: number;
    centerY: number;
    width: number;
    height: number;
    radius: number;
    rotation?: number;
  },
) => {
  const angle = (-((rectangle.rotation ?? 0) * Math.PI)) / 180;
  const offsetX = point.x - rectangle.centerX;
  const offsetY = point.y - rectangle.centerY;
  const x = offsetX * Math.cos(angle) - offsetY * Math.sin(angle);
  const y = offsetX * Math.sin(angle) + offsetY * Math.cos(angle);
  const innerWidth = rectangle.width / 2 - rectangle.radius;
  const innerHeight = rectangle.height / 2 - rectangle.radius;
  const nearestX = clamp(x, -innerWidth, innerWidth);
  const nearestY = clamp(y, -innerHeight, innerHeight);

  return Math.hypot(x - nearestX, y - nearestY) <= rectangle.radius;
};

export const isPointInFolderDecorationLayout = (point: {
  x: number;
  y: number;
}) => {
  const canvasPoint = {
    x: point.x * FOLDER_ARTWORK_WIDTH,
    y: point.y * FOLDER_ARTWORK_HEIGHT,
  };

  return (
    isPointInRoundedRectangle(canvasPoint, {
      centerX: 49.1865,
      centerY: 52.1865,
      width: 88,
      height: 88,
      radius: 12,
      rotation: -12,
    }) ||
    isPointInRoundedRectangle(canvasPoint, {
      centerX: 108.3375,
      centerY: 72.3375,
      width: 88,
      height: 88,
      radius: 12,
      rotation: 14,
    }) ||
    isPointInRoundedRectangle(canvasPoint, {
      centerX: 79.5,
      centerY: 118,
      width: 159,
      height: 130,
      radius: 15,
    })
  );
};

/** \uD3F4\uB354 \uD558\uB098\uC5D0 \uBC30\uCE58\uD560 \uC218 \uC788\uB294 \uC2A4\uD2F0\uCEE4 \uC218. \uC11C\uBC84 \uC81C\uD55C\uC740 \uC5C6\uACE0 \uD504\uB860\uD2B8 \uC815\uCC45\uC774\uB2E4. */
export const MAX_FOLDER_DECORATION_COUNT = 10;

/** \uC0AC\uC6A9\uC790\uAC00 \uBCF4\uC720\uD560 \uC218 \uC788\uB294 \uCEE4\uC2A4\uD140 \uC2A4\uD2F0\uCEE4 \uC218. \uCD08\uACFC\uD558\uBA74 \uC11C\uBC84\uAC00 STICKER4091\uC744 \uC900\uB2E4. */
export const MAX_CUSTOM_STICKER_COUNT = 10;

export const MAX_CUSTOM_STICKER_FILE_SIZE = 10 * 1024 * 1024;

/**
 * \uCEE4\uC2A4\uD140 \uC2A4\uD2F0\uCEE4\uB294 \uBC30\uACBD\uC774 \uC5C6\uC5B4\uC57C \uD558\uBBC0\uB85C PNG\uB9CC \uBC1B\uB294\uB2E4. JPEG\uB294 \uD22C\uBA85\uB3C4\uB97C \uB2F4\uC9C0
 * \uBABB\uD574 \uBCC0\uD658\uD574\uB3C4 \uD770 \uC0AC\uAC01\uD615\uC774 \uB41C\uB2E4.
 */
export const CUSTOM_STICKER_CONTENT_TYPE = 'image/png';

export const CUSTOM_STICKER_FILE_NAME = 'custom-sticker.png';

const DEFAULT_STICKER_PATH_SEGMENT = '/stickers/default/';

/**
 * 커스텀 스티커인지 이미지 경로로 판별한다.
 *
 * 기본 스티커는 흰 테두리가 그림에 들어 있지만 사용자가 올린 피사체는 그렇지
 * 않아서, 같이 붙이면 결이 달라 보인다. 그래서 커스텀 스티커에만 흰 프레임을
 * 씌운다.
 *
 * 여행 기록 상세 응답의 스티커에는 stickerType이 없고, 논리 삭제된 커스텀
 * 스티커는 카탈로그에서도 빠지기 때문에 조회로는 구분할 수 없다. 서버가 기본
 * 스티커만 stickers/default/ 아래에 두는 것을 이용한다.
 */
export const isCustomStickerImage = (imageUrl: string) =>
  Boolean(imageUrl) && !imageUrl.includes(DEFAULT_STICKER_PATH_SEGMENT);

/**
 * 사용자가 올린 피사체를 기본 스티커처럼 보이게 하는 흰 테두리.
 *
 * 실루엣을 따라 그려지므로 사진 비율과 무관하게 흰 여백이 생기지 않는다.
 * 정의는 globals.css에 있다.
 */
export const CUSTOM_STICKER_OUTLINE_CLASS = 'sticker-outline';

const createDecorationId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `decoration-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

/** \uAC80\uC99D\uC744 \uD1B5\uACFC\uD558\uBA74 \uBE48 \uBB38\uC790\uC5F4, \uC2E4\uD328\uD558\uBA74 \uC0AC\uC6A9\uC790\uC5D0\uAC8C \uBCF4\uC5EC\uC904 \uC0AC\uC720\uB97C \uB3CC\uB824\uC900\uB2E4. */
export const validateCustomStickerFile = (file: File): string => {
  if (file.type !== CUSTOM_STICKER_CONTENT_TYPE) {
    return '\uBC30\uACBD\uC774 \uC5C6\uB294 PNG \uC774\uBBF8\uC9C0\uB9CC \uCD94\uAC00\uD560 \uC218 \uC788\uC5B4\uC694.';
  }

  if (file.size > MAX_CUSTOM_STICKER_FILE_SIZE) {
    return '\uD30C\uC77C \uD558\uB098\uB2F9 10MB \uC774\uD558\uC758 \uC774\uBBF8\uC9C0\uB9CC \uCD94\uAC00\uD560 \uC218 \uC788\uC5B4\uC694.';
  }

  return '';
};

interface ReadableClipboardItem {
  types: readonly string[];
  getType: (type: string) => Promise<Blob>;
}

/**
 * \uD074\uB9BD\uBCF4\uB4DC API\uB85C \uBCF5\uC0AC\uD574 \uB454 PNG\uB97C \uC77D\uC5B4 \uC628\uB2E4.
 *
 * \uBAA8\uBC14\uC77C\uC5D0\uB294 Ctrl+V\uAC00 \uC5C6\uC5B4 paste \uC774\uBCA4\uD2B8\uAC00 \uBC1C\uC0DD\uD558\uC9C0 \uC54A\uB294\uB2E4. \uC544\uC774\uD3F0 \uC0AC\uC9C4 \uC571\uC758
 * '\uD53C\uC0AC\uCCB4 \uBCF5\uC0AC'\uB098 \uC548\uB4DC\uB85C\uC774\uB4DC \uD53C\uC0AC\uCCB4 \uCD94\uCD9C \uACB0\uACFC\uB294 \uD074\uB9BD\uBCF4\uB4DC\uC5D0\uB9CC \uC62C\uB77C\uAC00\uACE0 \uAC24\uB7EC\uB9AC\uC5D0
 * \uC800\uC7A5\uB418\uC9C0 \uC54A\uC73C\uBBC0\uB85C, \uD30C\uC77C \uC120\uD0DD\uC73C\uB85C\uB294 \uAC00\uC838\uC62C \uC218 \uC5C6\uB2E4.
 */
export const readStickerImageFromClipboard = async (clipboard: {
  read: () => Promise<ReadonlyArray<ReadableClipboardItem>>;
}): Promise<File | null> => {
  const clipboardItems = await clipboard.read();

  for (const item of clipboardItems) {
    if (!item.types.includes(CUSTOM_STICKER_CONTENT_TYPE)) {
      continue;
    }

    const image = await item.getType(CUSTOM_STICKER_CONTENT_TYPE);

    // \uD074\uB9BD\uBCF4\uB4DC \uD56D\uBAA9\uC5D0\uB294 \uD30C\uC77C\uBA85\uC774 \uC5C6\uC5B4 \uC9C1\uC811 \uB9CC\uB4E4\uC5B4 \uC900\uB2E4.
    return new File([image], CUSTOM_STICKER_FILE_NAME, {
      type: CUSTOM_STICKER_CONTENT_TYPE,
    });
  }

  return null;
};

/** \uB370\uC2A4\uD06C\uD1B1 \uBD99\uC5EC\uB123\uAE30(Ctrl+V) \uD56D\uBAA9 \uC911 \uCCAB \uBC88\uC9F8 PNG \uC774\uBBF8\uC9C0\uB97C \uAEBC\uB0B8\uB2E4. */
export const getPastedStickerImage = (
  items: ReadonlyArray<{
    kind: string;
    type: string;
    getAsFile: () => File | null;
  }>,
): File | null => {
  for (const item of items) {
    if (item.kind === 'file' && item.type === CUSTOM_STICKER_CONTENT_TYPE) {
      const file = item.getAsFile();

      if (file) {
        return file;
      }
    }
  }

  return null;
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

export const getDecorationDragPoint = (
  rect: CanvasRect,
  clientX: number,
  clientY: number,
) =>
  getNormalizedCanvasPoint(
    rect,
    clientX,
    clientY,
    FOLDER_DECORATION_CANVAS_BOUNDS,
  );

export const isFolderDecorationDropTarget = (
  rect: CanvasRect,
  clientX: number,
  clientY: number,
) =>
  isPointInFolderDecorationLayout({
    x: (clientX - rect.left) / rect.width,
    y: (clientY - rect.top) / rect.height,
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

/** 목록에서 탭했을 때 스티커가 놓이는 자리. */
export const FOLDER_DECORATION_DEFAULT_POINT = { x: 0.5, y: 0.5 };

export const createFolderDecoration = (
  seed: FolderDecorationSeed,
  decorations: FolderDecorationLayer[],
  // 목록에서 끌어다 놓으면 손을 뗀 자리에 놓인다.
  point: { x: number; y: number } = FOLDER_DECORATION_DEFAULT_POINT,
): TravelFolderDecoration => ({
  id: createDecorationId(),
  stickerId: seed.stickerId,
  imageUrl: seed.imageUrl,
  x: point.x,
  y: point.y,
  rotation: 0,
  scale: 1,
  zIndex: Math.max(0, ...decorations.map((decoration) => decoration.zIndex)) + 1,
});

export const appendFolderDecoration = (
  decorations: TravelFolderDecoration[],
  seed: FolderDecorationSeed,
  point?: { x: number; y: number },
) => {
  if (decorations.length >= MAX_FOLDER_DECORATION_COUNT) {
    return { decorations, added: false };
  }

  return {
    decorations: [
      ...decorations,
      createFolderDecoration(seed, decorations, point),
    ],
    added: true,
  };
};

export const shouldAppendFolderDecorationAfterDrag = ({
  isCancelled,
  movedDistance,
  isDropTarget,
}: {
  isCancelled: boolean;
  movedDistance: number;
  isDropTarget: boolean;
}) =>
  !isCancelled && (isDropTarget || movedDistance <= 8);

export const getDraggingStickerPreviewStyle = (
  point: { x: number; y: number },
  scale: number,
): CSSProperties => ({
  left: point.x,
  top: point.y,
  transform: `translate(-50%, -50%) scale(${scale})`,
});

/**
 * '만들기' 탭의 슬롯 상태.
 *
 * 보유 개수만 보고 판단한다. 폴더에 몇 개를 배치했는지는 서버의 커스텀
 * 스티커 보유 한도와 무관하다.
 */
export const getCustomStickerSlotState = (customStickerCount: number) => {
  const canAdd = customStickerCount < MAX_CUSTOM_STICKER_COUNT;

  return {
    canAdd,
    emptySlotCount: canAdd
      ? MAX_CUSTOM_STICKER_COUNT - customStickerCount - 1
      : 0,
  };
};
