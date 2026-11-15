import { createContext } from 'react';

/**
 * useGlobalScale이 뷰포트 대신 쓸 고정 scale. null이면 기존대로 뷰포트 폭에서
 * 계산한다(모바일 기본 동작).
 *
 * 데스크톱 뷰는 이 값을 DESKTOP_SCALE로 고정해 감싼다 — 그래야 공용 컴포넌트가
 * 데스크톱에서 1.28배(APP_MAX_WIDTH / GLOBAL_DESIGN_WIDTH)로 부풀지 않는다.
 */
export const ScaleContext = createContext<number | null>(null);
