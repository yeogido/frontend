import assert from 'node:assert/strict';
import test from 'node:test';
import { AxiosError, AxiosHeaders } from 'axios';

const storage = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

const { useAuthStore } = await import('../src/store/auth.store.ts');
const { validateStoredSession } = await import('../src/utils/authSession.ts');
const { default: apiClient } = await import('../src/apis/common/apiClient.ts');

const token = (exp: number) =>
  `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
const expiredToken = token(Math.floor(Date.now() / 1000) - 60);
const validToken = token(Math.floor(Date.now() / 1000) + 3600);
const auth = {
  userId: 1,
  role: 'USER',
  accessToken: expiredToken,
  refreshToken: 'refresh-token',
};

test('keeps an expired access token with a refresh token on startup', () => {
  useAuthStore.getState().setAuth(auth);
  validateStoredSession();
  assert.equal(useAuthStore.getState().isAuthenticated, true);
  assert.equal(useAuthStore.getState().refreshToken, 'refresh-token');
});

test('clears an expired session that cannot be refreshed', () => {
  useAuthStore.getState().setAuth({ ...auth, refreshToken: '' });
  validateStoredSession();
  assert.equal(useAuthStore.getState().isAuthenticated, false);
});

test('keeps an unexpired session on startup', () => {
  useAuthStore.getState().setAuth({ ...auth, accessToken: validToken });
  validateStoredSession();
  assert.equal(useAuthStore.getState().accessToken, validToken);
});

test('a restored expired session reissues and retries its first request', async () => {
  useAuthStore.getState().setAuth(auth);
  validateStoredSession();
  const calls: string[] = [];
  const previousAdapter = apiClient.defaults.adapter;
  apiClient.defaults.adapter = async (config) => {
    calls.push(config.url ?? '');
    if (config.url === '/auth/reissue') {
      assert.deepEqual(JSON.parse(config.data), {
        refreshToken: 'refresh-token',
      });
      return {
        data: {
          result: {
            ...auth,
            accessToken: validToken,
            refreshToken: 'new-refresh',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config,
      };
    }
    if (config.headers.get('Authorization') === `Bearer ${expiredToken}`) {
      const response = {
        data: {},
        status: 401,
        statusText: 'Unauthorized',
        headers: new AxiosHeaders(),
        config,
      };
      throw new AxiosError(
        'Unauthorized',
        'ERR_BAD_REQUEST',
        config,
        undefined,
        response
      );
    }
    assert.equal(config.headers.get('Authorization'), `Bearer ${validToken}`);
    return {
      data: { result: 'ok' },
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config,
    };
  };
  try {
    assert.equal((await apiClient.get('/protected')).data, 'ok');
    assert.deepEqual(calls, ['/protected', '/auth/reissue', '/protected']);
    assert.equal(useAuthStore.getState().refreshToken, 'new-refresh');
  } finally {
    apiClient.defaults.adapter = previousAdapter;
    useAuthStore.getState().clearAuth();
  }
});
