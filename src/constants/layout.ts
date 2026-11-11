export const APP_MIN_WIDTH = 320;
export const APP_MAX_WIDTH = 500;
export const GLOBAL_DESIGN_WIDTH = 390;
export const GLOBAL_CONTENT_WIDTH = 342;
export const GLOBAL_GUTTER = 24;
export const MIN_TOUCH_TARGET = 44;
export const APP_HEADER_HEIGHT = 56;

/**
 * 데스크톱 전용 레이아웃이 시작되는 폭. 이 아래(태블릿 포함)는 기존 모바일
 * UI를 그대로 쓴다 — 390px 기준폭에 scale을 곱하는 방식(getAppScale).
 */
export const DESKTOP_MIN_WIDTH = 1024;

/** 데스크톱 뷰에서는 비례 확대를 쓰지 않고 1:1 크기로 그린다. */
export const DESKTOP_SCALE = 1;
