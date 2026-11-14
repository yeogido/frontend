/**
 * 같은 화면 안에서 보기만 바꾸는 이동(예: 검색 조건 칩 선택)에 navigate state로
 * 넘기면 ScrollToTop이 맨 위로 올리지 않는다.
 */
export const PRESERVE_SCROLL_STATE = { preserveScroll: true } as const;

/** navigate state가 스크롤 유지를 요청했는지 확인한다. */
export const shouldPreserveScroll = (state: unknown): boolean =>
  typeof state === 'object' &&
  state !== null &&
  'preserveScroll' in state &&
  state.preserveScroll === true;
