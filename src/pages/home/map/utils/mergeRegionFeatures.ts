import type { Feature, MultiPolygon, Position } from 'geojson';

import type { KoreaCityGeoJson, KoreaCityFeature } from '../types/map';

export interface RegionMergeSpec {
  /** 병합 후 남길 시군구 코드 */
  code: string;
  /** 병합 후 지역명 */
  name: string;
  /** 합칠 지역들의 코드. 남길 코드도 포함한다. */
  memberCodes: readonly string[];
}

const toKey = (position: Position) => position.join(',');
const toUndirectedKey = (from: Position, to: Position) =>
  [toKey(from), toKey(to)].sort().join('|');

const toRings = (feature: Feature): Position[][] => {
  const { geometry } = feature;

  if (geometry.type === 'Polygon') {
    return geometry.coordinates;
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flat();
  }

  return [];
};

/**
 * 맞닿은 폴리곤들을 하나로 합친다.
 *
 * 두 지역이 경계를 공유하면 같은 변이 양쪽 링에 한 번씩, 총 두 번
 * 나타난다. 두 번 이상 나온 변을 빼면 바깥 윤곽만 남고, 그 조각들을
 * 이어 붙이면 통합 도형이 된다. 폴리곤 불리언 연산 라이브러리 없이
 * 처리하기 위한 방법이며, 좌표가 정확히 일치할 때만 성립한다.
 *
 * 좌표가 어긋나 공유 변을 못 찾으면 내부 경계가 그대로 남는다. 지역이
 * 사라지지는 않으므로 지도가 깨지지는 않는다.
 */
const unionRings = (rings: readonly Position[][]): Position[][] => {
  const edgeCounts = new Map<string, number>();

  rings.forEach((ring) => {
    for (let index = 0; index < ring.length - 1; index += 1) {
      const key = toUndirectedKey(ring[index], ring[index + 1]);

      edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
    }
  });

  const outgoingEdges = new Map<string, Position[]>();
  let remainingEdges = 0;

  rings.forEach((ring) => {
    for (let index = 0; index < ring.length - 1; index += 1) {
      const from = ring[index];
      const to = ring[index + 1];

      // 두 번 이상 나온 변은 지역 사이 경계라 바깥 윤곽이 아니다.
      if ((edgeCounts.get(toUndirectedKey(from, to)) ?? 0) > 1) {
        continue;
      }

      const fromKey = toKey(from);
      const edges = outgoingEdges.get(fromKey);

      if (edges) {
        edges.push(to);
      } else {
        outgoingEdges.set(fromKey, [to]);
      }

      remainingEdges += 1;
    }
  });

  const mergedRings: Position[][] = [];

  while (remainingEdges > 0) {
    const start = [...outgoingEdges.entries()].find(
      ([, edges]) => edges.length > 0,
    )?.[0];

    if (!start) {
      break;
    }

    const ring: Position[] = [start.split(',').map(Number)];
    let cursor = start;

    while (remainingEdges > 0) {
      const edges = outgoingEdges.get(cursor);
      const next = edges?.shift();

      if (!next) {
        break;
      }

      remainingEdges -= 1;
      ring.push(next);
      cursor = toKey(next);

      if (cursor === start) {
        break;
      }
    }

    // 점 3개 미만이면 면이 되지 않는다.
    if (ring.length > 3) {
      mergedRings.push(ring);
    }
  }

  return mergedRings;
};

/** 여러 지역 도형을 하나로 합친 geometry. 합칠 게 없으면 null. */
export function unionFeatures(
  features: readonly Feature[],
): MultiPolygon | null {
  const coordinates = unionRings(features.flatMap(toRings)).map((ring) => [
    ring,
  ]);

  return coordinates.length > 0
    ? { type: 'MultiPolygon', coordinates }
    : null;
}

/**
 * 행정구역 통합이 반영되지 않은 지도 데이터를 통합 후 상태로 바꾼다.
 * 합쳐진 지역들은 하나의 Feature가 되고, 나머지는 순서 그대로 남는다.
 */
export function mergeRegionFeatures(
  geoJson: KoreaCityGeoJson,
  specs: readonly RegionMergeSpec[],
): KoreaCityGeoJson {
  const mergedByCode = new Map<string, KoreaCityFeature>();
  const removedCodes = new Set<string>();

  specs.forEach((spec) => {
    const members = geoJson.features.filter((feature) =>
      spec.memberCodes.includes(feature.properties.code),
    );

    if (members.length < 2) {
      return;
    }

    const geometry = unionFeatures(members);

    if (!geometry) {
      return;
    }

    spec.memberCodes.forEach((code) => removedCodes.add(code));
    mergedByCode.set(spec.code, {
      type: 'Feature',
      properties: { code: spec.code, name: spec.name },
      geometry,
    });
  });

  if (mergedByCode.size === 0) {
    return geoJson;
  }

  const features: KoreaCityFeature[] = [];

  geoJson.features.forEach((feature) => {
    const { code } = feature.properties;

    if (!removedCodes.has(code)) {
      features.push(feature);
      return;
    }

    // 통합 도형은 대표 코드 자리에 한 번만 넣는다.
    const merged = mergedByCode.get(code);

    if (merged) {
      features.push(merged);
    }
  });

  return { ...geoJson, features };
}
