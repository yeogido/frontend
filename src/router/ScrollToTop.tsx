import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

import { shouldPreserveScroll } from './preserveScroll';

/**
 * 경로나 쿼리가 바뀌면 맨 위로 스크롤한다. 같은 화면에서 보기만 바꾸는 이동은
 * PRESERVE_SCROLL_STATE를 state로 넘겨 위치를 유지한다. 뒤로가기(POP)는
 * state와 상관없이 지금처럼 맨 위로 올린다.
 */
function ScrollToTop() {
  const { pathname, search, state } = useLocation();
  const navigationType = useNavigationType();
  const preserveScroll =
    navigationType !== 'POP' && shouldPreserveScroll(state);

  useEffect(() => {
    if (preserveScroll) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search, preserveScroll]);

  return null;
}

export default ScrollToTop;
