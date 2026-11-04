import assert from 'node:assert/strict';
import test from 'node:test';
import { handleWalkingRoute } from '../api/tmap/walkingRoute.ts';
import { fetchTmapWalkingDurationMinutes } from '../src/apis/tmapWalkingDuration.ts';
import { fetchCourseTravelTimes } from '../src/apis/courseTravelTimes.ts';

const start = { longitude: 127, latitude: 37.5 };
const end = { longitude: 127.01, latitude: 37.51 };
const request = () =>
  new Request(
    'https://example.test/tmap-routing/walk?origin=127,37.5&destination=127.01,37.51'
  );

test('TMAP proxy sends the server key and valid WGS84 points, returning only duration', async () => {
  const response = await handleWalkingRoute(
    request(),
    'server-key',
    async (url, init) => {
      assert.equal(
        String(url),
        'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1'
      );
      assert.equal(new Headers(init?.headers).get('appKey'), 'server-key');
      assert.equal(init?.method, 'POST');
      const body = JSON.parse(String(init?.body));
      assert.deepEqual(
        [body.startX, body.startY, body.endX, body.endY],
        [127, 37.5, 127.01, 37.51]
      );
      assert.equal(body.reqCoordType, 'WGS84GEO');
      return Response.json({
        features: [
          { properties: { totalTime: 480 }, geometry: { coordinates: [] } },
        ],
      });
    }
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { durationSeconds: 480 });
});

test('missing key, invalid coordinates and unsupported method do not call TMAP', async () => {
  const neverFetch: typeof fetch = async () => {
    throw new Error('must not call');
  };
  assert.equal(
    (await handleWalkingRoute(request(), undefined, neverFetch)).status,
    503
  );
  for (const origin of ['', ',', '181,37', '127,91', 'NaN,37', '127,37,1']) {
    assert.equal(
      (
        await handleWalkingRoute(
          new Request(
            `https://example.test/?origin=${origin}&destination=127,37`
          ),
          'key',
          neverFetch
        )
      ).status,
      400
    );
  }
  assert.equal(
    (
      await handleWalkingRoute(
        new Request(request(), { method: 'POST' }),
        'key',
        neverFetch
      )
    ).status,
    405
  );
});

test('upstream failures are isolated and provider error details never reach clients', async () => {
  const response = await handleWalkingRoute(
    request(),
    'private-key',
    async () => new Response('private provider details', { status: 401 })
  );
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /private/);
  const failed = await handleWalkingRoute(request(), 'key', async () => {
    throw new Error('network failure');
  });
  assert.equal(failed.status, 502);
  const noRoute = await handleWalkingRoute(request(), 'key', async () =>
    Response.json({ features: [] })
  );
  assert.deepEqual(await noRoute.json(), { durationSeconds: null });
});

test('walking seconds round up to minutes at the display boundary', async (t) => {
  let seconds: number | null = 480;
  t.mock.method(
    globalThis,
    'fetch',
    async (url: string, init?: RequestInit) => {
      const parsed = new URL(url, 'https://example.test');
      assert.equal(parsed.pathname, '/tmap-routing/walk');
      assert.equal(parsed.searchParams.get('origin'), '127,37.5');
      assert.equal(parsed.searchParams.get('destination'), '127.01,37.51');
      assert.equal(init?.signal, controller.signal);
      return Response.json({ durationSeconds: seconds });
    }
  );
  const controller = new AbortController();
  for (const [input, expected] of [
    [480, 8],
    [1, 1],
    [1740, 29],
    [1741, 30],
    [1800, 30],
    [0, 0],
    [null, null],
  ] as const) {
    seconds = input;
    assert.equal(
      await fetchTmapWalkingDurationMinutes(start, end, controller.signal),
      expected
    );
  }
});

test('registration collects all three modes and tolerates walking not configured or failing', async (t) => {
  let walkStatus = 200;
  t.mock.method(globalThis, 'fetch', async (url: string) => {
    if (url.startsWith('/tmap-routing/walk'))
      return walkStatus === 200
        ? Response.json({ durationSeconds: 480 })
        : new Response(null, { status: walkStatus });
    if (url.startsWith('/kakao-routing/car'))
      return Response.json({
        routes: [{ result_code: 0, summary: { duration: 180 } }],
      });
    if (url.startsWith('/odsay-api/'))
      return Response.json({ result: { path: [{ info: { totalTime: 12 } }] } });
    throw new Error('Unexpected URL');
  });
  assert.deepEqual(await fetchCourseTravelTimes(start, end), [
    { transportMode: 'WALK', durationMinutes: 8 },
    { transportMode: 'CAR', durationMinutes: 3 },
    { transportMode: 'PUBLIC', durationMinutes: 12 },
  ]);
  for (const status of [503, 502]) {
    walkStatus = status;
    assert.deepEqual(await fetchCourseTravelTimes(start, end), [
      { transportMode: 'CAR', durationMinutes: 3 },
      { transportMode: 'PUBLIC', durationMinutes: 12 },
    ]);
  }
});
