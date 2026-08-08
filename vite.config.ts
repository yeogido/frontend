import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import {
  InvalidPlaceHoursRequestError,
  lookupPlaceHours,
  type PlaceHoursRequest,
} from './api/google-places/placeHours.ts';
import {
  InvalidPlacePhotoRequestError,
  lookupPlacePhoto,
  type PlacePhotoRequest,
} from './api/google-places/placePhoto.ts';

function sendJson(
  response: import('node:http').ServerResponse,
  body: unknown,
  status = 200
) {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function googlePlacesDevPlugin(apiKey: string | undefined): Plugin {
  return {
    name: 'google-places-hours-dev-api',
    configureServer(server) {
      server.middlewares.use(
        '/google-places/hours',
        async (request, response) => {
          if (request.method !== 'POST') {
            sendJson(response, { message: 'Method not allowed.' }, 405);
            return;
          }

          if (!apiKey) {
            sendJson(
              response,
              { message: 'Google Places API is not configured.' },
              503
            );
            return;
          }

          let body = '';
          for await (const chunk of request) {
            body += chunk;
          }

          let requestBody: PlaceHoursRequest;
          try {
            requestBody = JSON.parse(body) as PlaceHoursRequest;
          } catch {
            sendJson(response, { message: 'Invalid request body.' }, 400);
            return;
          }

          try {
            sendJson(response, await lookupPlaceHours(requestBody, apiKey));
          } catch (error) {
            if (error instanceof InvalidPlaceHoursRequestError) {
              sendJson(response, { message: error.message }, 400);
              return;
            }

            sendJson(
              response,
              { message: 'Google Places request failed.' },
              502
            );
          }
        }
      );

      server.middlewares.use(
        '/google-places/photo',
        async (request, response) => {
          if (request.method !== 'POST') {
            sendJson(response, { message: 'Method not allowed.' }, 405);
            return;
          }

          if (!apiKey) {
            sendJson(
              response,
              { message: 'Google Places API is not configured.' },
              503
            );
            return;
          }

          let body = '';
          for await (const chunk of request) {
            body += chunk;
          }

          let requestBody: PlacePhotoRequest;
          try {
            requestBody = JSON.parse(body) as PlacePhotoRequest;
          } catch {
            sendJson(response, { message: 'Invalid request body.' }, 400);
            return;
          }

          try {
            sendJson(response, await lookupPlacePhoto(requestBody, apiKey));
          } catch (error) {
            if (error instanceof InvalidPlacePhotoRequestError) {
              sendJson(response, { message: error.message }, 400);
              return;
            }

            sendJson(
              response,
              { message: 'Google Places request failed.' },
              502
            );
          }
        }
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      googlePlacesDevPlugin(env.GOOGLE_MAPS_API_KEY),
    ],
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
