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

/**
 * 데스크톱 뷰 안에서 공용(모바일 기준) 컴포넌트에 주는 고정 scale.
 *
 * 데스크톱 시안은 뷰포트 폭에 따라 커지지 않으므로 고정값이어야 하고, 값
 * 1.25는 시안에서 읽은 비율이다 — 라벨 16→20, 입력 좌우 여백 16→20, 필드
 * 간격 32→40, 선택 카드 간격 16→20이 모두 390 모바일 기준의 1.25배다.
 * 선택 카드 크기처럼 비율이 다른 요소는 데스크톱 전용 컴포넌트에서 시안
 * 값을 직접 쓴다.
 */
export const DESKTOP_SCALE = 1.25;
