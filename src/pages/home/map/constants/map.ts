export const MAP_VIEWBOX_WIDTH = 400;
export const MAP_VIEWBOX_HEIGHT = 600;

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 5;
export const ZOOM_STEP = 0.5;

export const CITY_LAYER_ZOOM = 3;

export const BASE_ZOOM_SCALE = 2.5;

export const PROVINCE_LABEL_FONT_SIZE = 20; // 화면상 목표 크기(px 느낌의 스크린 기준 값)
export const CITY_LABEL_FONT_SIZE = 12;

// 축소할수록 글씨는 지도 좌표계에서 커진다. 상한이 없으면 최소 줌에서
// 서울·광주 라벨이 이웃한 인천·전라남도 라벨과 겹쳐 밀려난다.
// 기본 줌의 글씨(8.18)보다 크게 잡아 평소 화면에는 영향이 없다.
export const PROVINCE_LABEL_MAX_FONT_SIZE = 8.5;

// 경계선 굵기도 화면상 목표 값이다. renderScale로 나눠 그리지 않으면
// user 단위라 줌 배율만큼 그대로 굵어져서, 확대할수록 선이 지도를 덮는다.
export const PROVINCE_STROKE_WIDTH = 1.2;
export const CITY_STROKE_WIDTH = 0.6;