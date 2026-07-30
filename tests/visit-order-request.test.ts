import assert from 'node:assert/strict';
import test from 'node:test';

import { buildVisitEvents } from '../src/pages/local-recommendation/visit-order-selection/buildVisitEvents.ts';
import {
  buildCourseItemsFromVisitEvents,
  buildCourseRequest,
} from '../src/pages/local-recommendation/visit-order-selection/buildCourseRequest.ts';
import type { LocalRecommendationDraft } from '../src/store/localRecommendation.store.ts';

const place = {
  id: 'place-1',
  title: 'Beach',
  address: 'Gwangalli Road 1',
  imageKey: 'places/beach.jpg',
  externalPlaceId: 'kakao-1',
  categoryGroupCode: 'AT4',
  roadAddress: 'Gwangalli Road 1',
  lotAddress: 'Gwangalli Lot 1',
  latitude: 35.15,
  longitude: 129.11,
};

const festival = {
  id: 'festival-1',
  contentId: 20,
  tag: 'summer',
  title: 'Fireworks',
  address: 'Gwangalli',
};

test('buildVisitEvents orders combined places and festivals by persisted visitOrder', () => {
  const events = buildVisitEvents(
    [place],
    [festival],
    ['festival-1', 'place-1'],
    'fallback.png'
  );

  assert.deepEqual(
    events.map((event) => event.id),
    ['festival-1', 'place-1']
  );
  assert.equal(events[0]?.kind, 'CONTENT');
  assert.equal(events[1]?.kind, 'PLACE');
});

test('buildVisitEvents falls back to insertion order when nothing is persisted', () => {
  const events = buildVisitEvents([place], [festival], [], 'fallback.png');

  assert.deepEqual(
    events.map((event) => event.id),
    ['place-1', 'festival-1']
  );
});

test('buildCourseItemsFromVisitEvents assigns 1-based order and maps PLACE/CONTENT fields', () => {
  const events = buildVisitEvents([place], [festival], [], 'fallback.png');
  const items = buildCourseItemsFromVisitEvents(events);

  assert.deepEqual(items[0], {
    order: 1,
    type: 'PLACE',
    externalPlaceId: 'kakao-1',
    categoryGroupCode: 'AT4',
    name: 'Beach',
    roadAddress: 'Gwangalli Road 1',
    lotAddress: 'Gwangalli Lot 1',
    latitude: 35.15,
    longitude: 129.11,
    imageKey: 'places/beach.jpg',
  });
  assert.deepEqual(items[1], { order: 2, type: 'CONTENT', contentId: 20 });
});

const baseDraft: LocalRecommendationDraft = {
  neighborhood: {
    id: 2,
    name: 'Gwangalli',
    parentName: 'Busan',
  },
  basicInfo: {
    courseName: 'Busan night trip',
    summary: 'Ocean view course',
    duration: 'day-trip',
    visitStartMonth: '4',
    visitEndMonth: '10',
    transport: 'car',
    companion: 'friends',
  },
  tagIds: ['sea'],
  hashtagIds: [1, 3],
  coverImageKey: 'courses/thumbnail/abcd.jpg',
  festivals: [festival],
  places: [place],
  visitOrder: [],
};

test('buildCourseRequest maps local slugs to backend enums', () => {
  const events = buildVisitEvents([place], [festival], [], 'fallback.png');
  const request = buildCourseRequest(baseDraft, events);

  assert.ok(request);
  assert.equal(request?.durationType, 'DAY_TRIP');
  assert.equal(request?.transportType, 'CAR');
  assert.equal(request?.companionType, 'FRIEND');
  assert.equal(request?.monthStart, 4);
  assert.equal(request?.monthEnd, 10);
  assert.equal(request?.regionId, 2);
  assert.equal(request?.thumbnailKey, 'courses/thumbnail/abcd.jpg');
  assert.deepEqual(request?.hashtagIds, [1, 3]);
  assert.equal(request?.courseItems.length, 2);
});

test('buildCourseRequest returns null when required draft fields are missing', () => {
  const events = buildVisitEvents([place], [festival], [], 'fallback.png');

  assert.equal(
    buildCourseRequest({ ...baseDraft, neighborhood: null }, events),
    null
  );
  assert.equal(
    buildCourseRequest({ ...baseDraft, coverImageKey: null }, events),
    null
  );
  assert.equal(buildCourseRequest(baseDraft, []), null);
});
