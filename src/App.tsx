import AppRouter from './router/AppRouter';
import ScrollToTop from './router/ScrollToTop';

import { APP_MAX_WIDTH } from './constants/layout';

function App() {
  return (
    <div className="min-h-dvh bg-[#FFEBE5]">
      <div
        className="relative mx-auto min-h-dvh w-full overflow-x-hidden bg-white"
        style={{ maxWidth: APP_MAX_WIDTH }}
      >
        <ScrollToTop />
        <AppRouter />
      </div>
    </div>
  );
}

export default App;