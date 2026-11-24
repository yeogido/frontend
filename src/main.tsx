import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import './styles/globals.css';
import App from './App';
import { validateStoredSession } from './utils/authSession';

validateStoredSession();

const DEFAULT_QUERY_RETRY_COUNT = 3;

// 401·403·404 같은 4xx는 다시 불러도 결과가 같다. 기본 재시도(1·2·4초 백오프)를
// 그대로 두면 비로그인으로 권한이 필요한 화면에 들어왔을 때 응답이 이미 왔는데도
// 약 7초 동안 스켈레톤만 보인다.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status;

        if (status !== undefined && status >= 400 && status < 500) {
          return false;
        }

        return failureCount < DEFAULT_QUERY_RETRY_COUNT;
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
