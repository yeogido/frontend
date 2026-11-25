import assert from 'node:assert/strict';
import test from 'node:test';
import {
  rememberTravelShareReturn,
  consumeTravelShareReturn,
} from '../src/pages/travel-record/utils/travelShareLoginReturn.ts';

function storage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
    removeItem: (key: string) => {
      items.delete(key);
    },
  };
}

test('returns to the validated shared page once after login', () => {
  const store = storage();
  const path = `/travel-record/shared/${'a'.repeat(64)}`;
  rememberTravelShareReturn(store, path);
  assert.equal(consumeTravelShareReturn(store), path);
  assert.equal(consumeTravelShareReturn(store), '/');
});

test('rejects an external or invalid return target', () => {
  const store = storage();
  rememberTravelShareReturn(store, '//evil.example');
  assert.equal(consumeTravelShareReturn(store), '/');
});
