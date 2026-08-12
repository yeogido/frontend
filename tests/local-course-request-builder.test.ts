import assert from 'node:assert/strict';
import test from 'node:test';

import { buildLocalCourseUpdateRequest } from '../src/pages/local-recommendation/visit-order-selection/buildCourseRequest.ts';

const draft = {
  neighborhood: { id: 1, name: 'Seoul', parentName: '' },
  basicInfo: {
    courseName: 'Seoul day trip',
    summary: 'A walk through Seoul.',
    duration: 'day-trip' as const,
    visitStartMonth: '4',
    visitEndMonth: '5',
    transport: 'walking' as const,
    companion: 'solo' as const,
  },
  tagIds: [],
  hashtagIds: [],
  coverImageKey: 'thumbnails/seoul.jpg',
  festivals: [],
  places: [],
  visitOrder: [],
};

const visitEvents = [
  {
    id: 'place-1',
    kind: 'PLACE' as const,
    name: 'Cafe',
    address: '1 Road',
    imageSrc: '',
    externalPlaceId: 'place-1',
    categoryGroupCode: 'CE7',
    roadAddress: '1 Road',
    lotAddress: '',
    latitude: 37.5,
    longitude: 127,
    imageKey: '',
  },
];

test('omits the route image key from an update when no new key is supplied', () => {
  const payload = buildLocalCourseUpdateRequest(draft, visitEvents, undefined);

  assert.equal('routeImageKey' in (payload ?? {}), false);
});
