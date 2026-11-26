import test from 'node:test';
import assert from 'node:assert/strict';
import { getTravelMapShareData } from '../src/pages/travel-record/utils/externalShare.ts';
import {
  consumeTravelShareReturn,
  rememberTravelShareReturn,
} from '../src/pages/travel-record/utils/travelShareLoginReturn.ts';

test('map sharing uses the target user and map tab', () => {
  const data = getTravelMapShareData(5, '여행자', 'https://yeogido.kr');
  assert.equal(data?.url, 'https://yeogido.kr/friends/5?tab=map');
  assert.equal(data?.buttonTitle, '지도 보기');
  assert.equal(getTravelMapShareData(0, '', 'https://yeogido.kr'), null);
});

test('map login return is restricted to the intended same-origin path', () => {
  const entries = new Map<string, string>();
  const store = {
    getItem: (k: string) => entries.get(k) ?? null,
    setItem: (k: string, v: string) => {
      entries.set(k, v);
    },
    removeItem: (k: string) => {
      entries.delete(k);
    },
  };
  rememberTravelShareReturn(store, '/friends/5?tab=map');
  assert.equal(consumeTravelShareReturn(store), '/friends/5?tab=map');
  rememberTravelShareReturn(
    store,
    '/friends/5?tab=map&redirect=https://evil.example'
  );
  assert.equal(consumeTravelShareReturn(store), '/');
});
