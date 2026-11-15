import { useLocation } from 'react-router-dom';

import AppRouter from './router/AppRouter';
import ScrollToTop from './router/ScrollToTop';
import { ToastProvider } from './components/toast';

import { APP_MAX_WIDTH } from './constants/layout';
import { hasDesktopView } from './constants/desktopRoutes';
import { LoginModalProvider } from './contexts/LoginModalProvider';
import { useIsDesktop } from './hooks/useIsDesktop';
import { useResetLikesOnLogout } from './hooks/useResetLikesOnLogout';

function App() {
  useResetLikesOnLogout();

  const isDesktop = useIsDesktop();
  const { pathname } = useLocation();
  // 데스크톱 뷰가 있는 화면에서만 모바일 프레임을 푼다. 나머지 화면은 넓은
  // 창에서도 지금처럼 가운데 모바일 폭으로 보여야 한다.
  const isDesktopView = isDesktop && hasDesktopView(pathname);

  return (
    <LoginModalProvider>
      <ToastProvider>
        <div className={isDesktopView ? 'min-h-dvh' : 'min-h-dvh bg-[#FFEBE5]'}>
          <div
            className="relative mx-auto min-h-dvh w-full bg-[#F1F1F1]"
            style={{
              maxWidth: isDesktopView ? undefined : APP_MAX_WIDTH,
              display: 'flow-root',
            }}
          >
            <ScrollToTop />
            <AppRouter />
          </div>
        </div>
      </ToastProvider>
    </LoginModalProvider>
  );
}

export default App;
