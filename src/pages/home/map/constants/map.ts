export const MAP_VIEWBOX_WIDTH = 400;
export const MAP_VIEWBOX_HEIGHT = 600;

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 5;
export const ZOOM_STEP = 0.5;

export const CITY_LAYER_ZOOM = 3;

export const BASE_ZOOM_SCALE = 2.5;

export const PROVINCE_LABEL_FONT_SIZE = 20; // 화면상 목표 크기(px 느낌의 스크린 기준 값)
export const CITY_LABEL_FONT_SIZE = 12;

// 경계선 굵기도 화면상 목표 값이다. renderScale로 나눠 그리지 않으면
// user 단위라 줌 배율만큼 그대로 굵어져서, 확대할수록 선이 지도를 덮는다.
export const PROVINCE_STROKE_WIDTH = 1.2;
export const CITY_STROKE_WIDTH = 0.6;