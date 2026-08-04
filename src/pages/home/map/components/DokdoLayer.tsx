import { useMemo } from 'react';

import { geoMercator } from 'd3-geo';

import { koreaProvince } from '../assets/koreaProvince';
import {
  CITY_LABEL_FONT_SIZE,
  CITY_LAYER_ZOOM,
  MAP_VIEWBOX_HEIGHT,
  MAP_VIEWBOX_WIDTH,
} from '../constants/map';

const MAP_PADDING = 20;

/** 독도(경상북도 울릉군 독도리)의 실제 좌표 */
const DOKDO_COORDINATES: [number, number] = [131.8724, 37.2428];

const DOKDO_LABEL = '독도';

/**
 * 독도 윤곽. 아래 좌표는 로컬 기준(가로 13~91, 세로 8~53)이다.
 *
 * 실제 독도는 서도(서쪽, 큰 섬)와 동도(동쪽, 작은 섬)가 폭 150m 남짓의
 * 수로를 두고 마주보고, 주변에 부속 바위가 흩어져 있다. 두 섬 모두
 * 남북으로 길쭉하다. 타원 두 개로 두면 이 축척에서 그냥 점처럼 보여서,
 * 실제 윤곽에 가깝게 각진 폴리곤으로 그린다.
 */
const WEST_ISLET_PATH =
  'M27 8 L36 14 L41 24 L42 38 L36 50 L26 53 L17 46 L13 33 L15 20 L20 11 Z';
const EAST_ISLET_PATH =
  'M71 16 L79 22 L82 33 L78 45 L70 51 L62 44 L60 32 L64 21 Z';
const SATELLITE_ROCKS = [
  { cx: 50, cy: 46, r: 2.2 },
  { cx: 91, cy: 20, r: 1.8 },
  { cx: 46, cy: 15, r: 1.5 },
];

/**
 * 로컬 좌표 → viewBox 단위 배율. 폭 78 → 약 4.2 단위로, 옆의 울릉도
 * 도형(폭 6.65)의 63% 크기가 된다.
 *
 * renderScale로 나누지 않아 다른 지형과 똑같이 줌에 따라 확대된다.
 * 화면상 크기를 고정하면 확대할수록 울릉도에 비해 혼자 작아져서
 * 축척이 어긋나 보인다.
 */
const SHAPE_SCALE = 0.054;
const SHAPE_CENTER_X = 52;
const SHAPE_CENTER_Y = 30.5;
const SHAPE_BOTTOM_Y = 53;
/** 도형 중심에서 아래쪽 끝까지의 거리(viewBox 단위) */
const SHAPE_HALF_HEIGHT = (SHAPE_BOTTOM_Y - SHAPE_CENTER_Y) * SHAPE_SCALE;

interface DokdoLayerProps {
  /** 0.5 단위로 스냅된 현재 줌. 라벨 표시 여부를 가른다. */
  zoomLevel: number;
  /** 확대해도 화면상 크기가 유지되도록 나눌 배율 */
  renderScale: number;
}

/**
 * 독도 레이어.
 *
 * 지도 데이터(korea-city.json)에 독도가 빠져 있다. 울릉군(4794) 도형은
 * 울릉도 본섬(동경 130.800~130.916)만 담고 있고, 데이터 전체의 최동단도
 * 130.9165다. 그래서 다른 지역처럼 geojson에서 도형을 얻지 못하고,
 * 실제 좌표를 같은 투영에 넣어 위치만 계산한다.
 *
 * 실제 면적은 0.2km² 수준이라 이 축척에서는 점 하나도 되지 않으므로,
 * 서도와 동도를 알아볼 수 있게 과장한 크기로 그린다. 지형 표기이므로
 * 클릭 판정은 갖지 않는다.
 *
 * 투영 결과는 viewBox x≈434로 폭 400인 viewBox 바깥이다. 울릉도가
 * x≈377이라 그 동쪽으로 남는 여백이 거의 없어서, 홈 지도의 기본 축척
 * (initialZoom 0.9781)에서는 화면에 들어오지 않는다. 오른쪽으로 끌면
 * 보인다. 축척을 독도에 맞추면 지도가 30% 넘게 작아지고, 위치를 당겨
 * 그리면 실제 좌표가 아니게 되므로, 실제 좌표를 지키고 화면 밖에 두는
 * 쪽을 택했다.
 */
function DokdoLayer({ zoomLevel, renderScale }: DokdoLayerProps) {
  // 도 단위가 보이는 축소 상태에서는 라벨을 감춘다. LabelLayer가 도
  // 라벨에서 시/군 라벨로 바뀌는 지점과 같은 기준을 쓴다.
  const isCityZoom = zoomLevel >= CITY_LAYER_ZOOM;

  const [x, y] = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [
        [MAP_PADDING, MAP_PADDING],
        [
          MAP_VIEWBOX_WIDTH - MAP_PADDING,
          MAP_VIEWBOX_HEIGHT - MAP_PADDING,
        ],
      ],
      koreaProvince,
    );

    return projection(DOKDO_COORDINATES) ?? [Number.NaN, Number.NaN];
  }, []);

  if (Number.isNaN(x) || Number.isNaN(y)) {
    return null;
  }

  // 라벨만 화면상 크기를 유지한다. 시/군 라벨과 같은 상수를 써서
  // 같은 줌에서 켜지는 다른 지역명과 글씨 크기를 맞춘다.
  const fontSize = Math.max(CITY_LABEL_FONT_SIZE / renderScale, 1.5);
  const labelOffsetY = SHAPE_HALF_HEIGHT + fontSize * 0.85;

  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <title>{DOKDO_LABEL}</title>

      <g
        transform={`scale(${SHAPE_SCALE}) translate(${-SHAPE_CENTER_X} ${-SHAPE_CENTER_Y})`}
        fill="#FF6F41"
      >
        <path d={WEST_ISLET_PATH} />
        <path d={EAST_ISLET_PATH} />

        {SATELLITE_ROCKS.map(({ cx, cy, r }) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>

      {/* 라벨은 도형 중앙 기준으로 바로 아래에 붙인다. */}
      {isCityZoom ? (
        <text
          x={0}
          y={labelOffsetY}
          fontSize={fontSize}
          fontWeight={600}
          fill="#FF6F41"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {DOKDO_LABEL}
        </text>
      ) : null}
    </g>
  );
}

export default DokdoLayer;
