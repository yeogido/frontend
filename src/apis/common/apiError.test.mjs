import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';

const axiosStub = Buffer.from(
  'export default { isAxiosError: (error) => error?.isAxiosError === true };',
).toString('base64');

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'axios') {
      return {
        shortCircuit: true,
        url: `data:text/javascript;base64,${axiosStub}`,
      };
    }

    return nextResolve(specifier, context);
  },
});

const { normalizeApiError } = await import('./apiError.ts');

function createResponseLessAxiosError(code) {
  return {
    code,
    isAxiosError: true,
    message: 'Request failed',
  };
}

test('preserves the Axios cancellation code', () => {
  assert.deepEqual(
    normalizeApiError(createResponseLessAxiosError('ERR_CANCELED')),
    {
      code: 'ERR_CANCELED',
      message: 'Request failed',
    },
  );
});

test('preserves Axios timeout codes', () => {
  for (const code of ['ECONNABORTED', 'ETIMEDOUT']) {
    assert.deepEqual(normalizeApiError(createResponseLessAxiosError(code)), {
      code,
      message: 'Request failed',
    });
  }
});

test('maps other response-less Axios errors to a network error', () => {
  assert.deepEqual(normalizeApiError(createResponseLessAxiosError('ERR_NETWORK')), {
    code: 'NETWORK_ERROR',
    message: 'Request failed',
  });
});
