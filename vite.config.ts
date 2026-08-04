import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/kakao-routing': {
          target: 'https://dapi.kakao.com',
          changeOrigin: true,
          headers: {
            Authorization: `KakaoAK ${env.KAKAO_REST_API_KEY}`,
          },
          rewrite: (path) => path.replace(/^\/kakao-routing/, '/v2/routing'),
        },
      },
    },
  };
});
