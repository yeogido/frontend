import AppRouter from './router/AppRouter';
import ScrollToTop from './router/ScrollToTop';
import { ToastProvider } from './components/toast';

import { APP_MAX_WIDTH } from './constants/layout';

function App() {
  return (
    <div className="min-h-dvh bg-[#FFEBE5]">
      <div
        className="relative mx-auto min-h-dvh w-full bg-[#F1F1F1]"
        style={{ maxWidth: APP_MAX_WIDTH, display: 'flow-root' }}
      >
        <ToastProvider>
          <ScrollToTop />
          <AppRouter />
        </ToastProvider>
      </div>
    </div>
  );
}

export default App;
