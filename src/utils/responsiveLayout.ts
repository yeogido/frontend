import {
  APP_MAX_WIDTH,
  APP_MIN_WIDTH,
  GLOBAL_CONTENT_WIDTH,
  GLOBAL_DESIGN_WIDTH,
  GLOBAL_GUTTER,
} from '../constants/layout.ts';

export function getAppWidth(viewportWidth: number) {
  return Math.min(Math.max(viewportWidth, APP_MIN_WIDTH), APP_MAX_WIDTH);
}

export function getAppScale(viewportWidth: number) {
  return getAppWidth(viewportWidth) / GLOBAL_DESIGN_WIDTH;
}

export function scaleValue(designValue: number, scale: number, minimum = 0) {
  return Math.max(designValue * scale, minimum);
}

export function getContentWidth(scale: number) {
  return GLOBAL_CONTENT_WIDTH * scale;
}

export function getGutter(scale: number) {
  return GLOBAL_GUTTER * scale;
}
