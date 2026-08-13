import AppRouter from './router/AppRouter';
import ScrollToTop from './router/ScrollToTop';
import { ToastProvider } from './components/toast';

import { APP_MAX_WIDTH } from './constants/layout';
import { LoginModalProvider } from './contexts/LoginModalProvider';
import { useResetLikesOnLogout } from './hooks/useResetLikesOnLogout';

function App() {
  useResetLikesOnLogout();

  return (
    <LoginModalProvider>
      <ToastProvider>
        <div className="min-h-dvh bg-[#FFEBE5]">
          <div
            className="relative mx-auto min-h-dvh w-full bg-[#F1F1F1]"
            style={{ maxWidth: APP_MAX_WIDTH, display: 'flow-root' }}
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
