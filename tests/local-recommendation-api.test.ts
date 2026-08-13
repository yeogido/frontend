import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createLocalRecommendationWithClient,
  type CreateLocalRecommendationRequest,
} from '../src/apis/localRecommendations.ts';
import {
  buildCourseRequest,
  getCourseRequestValidationError,
} from '../src/pages/local-recommendation/visit-order-selection/buildCourseRequest.ts';
import { buildVisitEvents } from '../src/pages/local-recommendation/visit-order-selection/buildVisitEvents.ts';

test('uses the selected place image preview in visit-order cards', () => {
  const events = buildVisitEvents(
    [
      {
        id: 'place-1',
        title: 'Cafe',
        address: '1 Road',
        imageKey: null,
        externalPlaceId: 'place-1',
        categoryGroupCode: 'CE7',
        roadAddress: '1 Road',
        lotAddress: '',
        latitude: 37.5,
        longitude: 127,
      },
    ],
    [],
    [],
    'fallback.png',
    new Map([['place-1', 'blob:place-preview']])
  );

  assert.equal(events[0]?.imageSrc, 'blob:place-preview');
});

const createDraft = () => ({
  neighborhood: { id: 1, name: 'Seoul', parentName: '' },
  basicInfo: {
    courseName: 'Seoul day trip',
    summary: 'A walk through Seoul.',
    duration: 'day-trip',
    visitStartMonth: '4',
    visitEndMonth: '5',
    transport: 'walking',
    companion: 'solo',
  },
  tagIds: [],
  hashtagIds: [],
  coverImageKey: 'thumbnails/seoul.jpg',
  festivals: [],
  places: [],
  visitOrder: [],
});

test('maps basic information to Swagger course enums', () => {
  const payload = buildCourseRequest(createDraft(), [
    {
      id: 'place-1',
      kind: 'PLACE',
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
  ]);

  assert.equal(payload?.durationType, 'DAY_TRIP');
});

test('requires at least one place and an address for every place', () => {
  const draft = createDraft();

  assert.match(
    getCourseRequestValidationError(draft, [
      {
        id: 'content-1',
        kind: 'CONTENT',
        name: 'Festival',
        address: '',
        imageSrc: '',
        contentId: 1,
      },
    ]) ?? '',
    /장소/
  );
  assert.match(
    getCourseRequestValidationError(draft, [
      {
        id: 'place-1',
        kind: 'PLACE',
        name: 'Cafe',
        address: '',
        imageSrc: '',
        externalPlaceId: 'place-1',
        categoryGroupCode: 'CE7',
        roadAddress: '',
        lotAddress: '',
        latitude: 37.5,
        longitude: 127,
        imageKey: '',
      },
    ]) ?? '',
    /주소/
  );
});

test('posts the supplied course payload unchanged to /courses', async () => {
  const payload: CreateLocalRecommendationRequest = {
    title: 'Seoul day trip',
    regionId: 1,
    description: 'A walk through Seoul.',
    durationType: 'DAY_TRIP',
    transportType: 'WALK',
    companionType: 'FRIEND',
    monthStart: 4,
    monthEnd: 5,
    thumbnailKey: 'thumbnails/seoul.jpg',
    hashtagIds: [3, 7],
    courseItems: [
      {
        order: 1,
        type: 'PLACE',
        externalPlaceId: 'place-1',
        categoryGroupCode: 'FD6',
        name: 'Cafe',
        roadAddress: '1 Road',
        lotAddress: '1 Lot',
        latitude: 37.5,
        longitude: 127,
        imageKey: 'places/cafe.jpg',
      },
      { order: 2, type: 'CONTENT', contentId: 99 },
    ],
  };
  const calls: Array<{ path: string; body: CreateLocalRecommendationRequest }> =
    [];
  const client = {
    post: async (path: string, body: CreateLocalRecommendationRequest) => {
      calls.push({ path, body });
      // apiClient's response interceptor already unwraps the envelope, so
      // a successful call resolves with the bare result.
      return { data: { courseId: 123 } };
    },
  };

  const result = await createLocalRecommendationWithClient(client, payload);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].path, '/courses');
  // createLocalRecommendationWithClient normalizes courseItems(영업 종료
  // 시각 24:00 -> 23:59 등)를 위해 항상 새 객체를 만들어 보낸다 — 주입된
  // client가 apiClient가 아니어도(테스트의 fake client처럼) 동작해야 해서
  // axios 인터셉터에 기대지 않는다. 그래서 참조는 달라지지만 내용은 그대로
  // 유지되는지를 확인한다.
  assert.deepStrictEqual(calls[0].body, payload);
  assert.deepEqual(result, { courseId: 123 });
});

test('throws the server message when course creation fails', async () => {
  const payload: CreateLocalRecommendationRequest = {
    title: 'Seoul day trip',
    regionId: 1,
    description: 'A walk through Seoul.',
    durationType: 'DAY_TRIP',
    transportType: 'WALK',
    companionType: 'FRIEND',
    monthStart: 4,
    monthEnd: 5,
    thumbnailKey: 'thumbnails/seoul.jpg',
    hashtagIds: [3, 7],
    courseItems: [{ order: 1, type: 'CONTENT', contentId: 99 }],
  };
  const client = {
    // apiClient's response interceptor rejects with a NormalizedApiError on
    // failure, it never resolves with an isSuccess: false envelope.
    post: async () => {
      throw {
        code: 'COURSE400',
        message: '코스 생성에 실패했습니다.',
      };
    },
  };

  await assert.rejects(
    () => createLocalRecommendationWithClient(client, payload),
    (error: unknown) =>
      typeof error === 'object' &&
      error !== null &&
      (error as { message?: string }).message === '코스 생성에 실패했습니다.'
  );
});
