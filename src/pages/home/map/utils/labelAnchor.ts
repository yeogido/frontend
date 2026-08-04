export type ProjectedRing = readonly (readonly [number, number])[];

/** 셀 하나를 더 쪼개도 이만큼밖에 못 좋아지면 멈춘다. */
const PRECISION_RATIO = 0.02;
/** 오목한 도형에서도 수십 회면 수렴한다. 무한 루프만 막는 상한. */
const MAX_ITERATIONS = 2000;

const distanceToSegmentSquared = (
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) => {
  let closestX = ax;
  let closestY = ay;
  const dx = bx - ax;
  const dy = by - ay;

  if (dx !== 0 || dy !== 0) {
    const t = ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      closestX = bx;
      closestY = by;
    } else if (t > 0) {
      closestX = ax + dx * t;
      closestY = ay + dy * t;
    }
  }

  return (x - closestX) ** 2 + (y - closestY) ** 2;
};

/**
 * 점에서 도형 경계까지의 거리. 도형 안이면 양수, 밖이면 음수다.
 * 링을 모두 훑으므로 구멍(내부 링)도 자연스럽게 반영된다.
 */
export function signedDistanceToPolygon(
  x: number,
  y: number,
  rings: readonly ProjectedRing[],
) {
  let isInside = false;
  let minDistanceSquared = Infinity;

  rings.forEach((ring) => {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
      const [ax, ay] = ring[i];
      const [bx, by] = ring[j];

      // 반직선 교차 판정(ray casting)
      if (
        ay > y !== by > y &&
        x < ((bx - ax) * (y - ay)) / (by - ay) + ax
      ) {
        isInside = !isInside;
      }

      minDistanceSquared = Math.min(
        minDistanceSquared,
        distanceToSegmentSquared(x, y, ax, ay, bx, by),
      );
    }
  });

  if (minDistanceSquared === Infinity) {
    return -Infinity;
  }

  return (isInside ? 1 : -1) * Math.sqrt(minDistanceSquared);
}

interface Cell {
  x: number;
  y: number;
  /** 셀 반지름(한 변의 절반) */
  half: number;
  /** 셀 중심의 부호 있는 거리 */
  distance: number;
  /** 이 셀 안에서 나올 수 있는 거리의 상한 */
  potential: number;
}

const createCell = (
  x: number,
  y: number,
  half: number,
  rings: readonly ProjectedRing[],
): Cell => {
  const distance = signedDistanceToPolygon(x, y, rings);

  return {
    x,
    y,
    half,
    distance,
    potential: distance + half * Math.SQRT2,
  };
};

/**
 * 최대내접원의 중심(pole of inaccessibility)을 찾는다.
 *
 * 무게중심은 도형이 오목하면 경계 밖으로 나간다. C자로 휜 해안선이나
 * 섬이 흩어진 지역에서 라벨이 바다에 찍히는 이유다. 대신 도형 경계에서
 * 가장 멀리 떨어진 지점을 찾으면 항상 도형 안쪽이고, 주변 여유도 가장
 * 크다.
 *
 * 바운딩 박스를 격자로 덮고, 남은 셀 중 가능성이 가장 큰 것부터 넷으로
 * 쪼개며 좁혀간다. 이미 찾은 최선보다 나아질 수 없는 셀은 버린다.
 *
 * 반환값의 `radius`는 그 지점에서 경계까지의 거리, 즉 내접원 반지름이다.
 */
export function findPoleOfInaccessibility(
  rings: readonly ProjectedRing[],
): { x: number; y: number; radius: number } | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  rings.forEach((ring) =>
    ring.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }),
  );

  const width = maxX - minX;
  const height = maxY - minY;
  const cellSize = Math.min(width, height);

  if (!Number.isFinite(cellSize) || cellSize === 0) {
    return null;
  }

  const initialHalf = cellSize / 2;
  const queue: Cell[] = [];

  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      queue.push(createCell(x + initialHalf, y + initialHalf, initialHalf, rings));
    }
  }

  let best = createCell(
    minX + width / 2,
    minY + height / 2,
    0,
    rings,
  );
  const precision = cellSize * PRECISION_RATIO;
  let iterations = 0;

  while (queue.length > 0 && iterations < MAX_ITERATIONS) {
    iterations += 1;

    let bestIndex = 0;

    for (let i = 1; i < queue.length; i += 1) {
      if (queue[i].potential > queue[bestIndex].potential) {
        bestIndex = i;
      }
    }

    const [cell] = queue.splice(bestIndex, 1);

    if (cell.distance > best.distance) {
      best = cell;
    }

    if (cell.potential - best.distance <= precision) {
      continue;
    }

    const half = cell.half / 2;

    queue.push(
      createCell(cell.x - half, cell.y - half, half, rings),
      createCell(cell.x + half, cell.y - half, half, rings),
      createCell(cell.x - half, cell.y + half, half, rings),
      createCell(cell.x + half, cell.y + half, half, rings),
    );
  }

  return best.distance > 0
    ? { x: best.x, y: best.y, radius: best.distance }
    : null;
}
