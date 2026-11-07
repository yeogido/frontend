import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createLocalRecommendationWithClient,
  type CreateLocalRecommendationRequest,
} from '../src/apis/localRecommendations.ts';
import {
  buildCourseRequest,
  buildLocalCourseUpdateRequest,
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
    new Map([['place-1', 'blob:place-preview']]),
    1
  );

  assert.equal(events[0][0]?.imageSrc, 'blob:place-preview');
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
  hashtagIds: [3],
  coverImageKey: 'thumbnails/seoul.jpg',
  festivals: [],
  places: [],
  visitOrder: [],
  totalDays: 1,
  editingCourseId: null,
  existingThumbnailUrl: null,
});

test('maps basic information to Swagger course enums', () => {
  const payload = buildCourseRequest(
    createDraft(),
    [
      [
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
          imageKey: 'places/cafe.jpg',
        },
      ],
    ],
    undefined,
    'routes/seoul.png'
  );

  assert.equal(payload?.durationType, 'DAY_TRIP');
  assert.equal(payload?.totalDays, 1);
  assert.deepEqual(
    payload?.courseItems.map((item) => [item.day, item.order]),
    [[1, 1]]
  );
});

test('requires at least one place and an address for every place', () => {
  const draft = createDraft();

  assert.match(
    getCourseRequestValidationError(draft, [
      [
        {
          id: 'content-1',
          kind: 'CONTENT',
          name: 'Festival',
          address: '',
          imageSrc: '',
          contentId: 1,
        },
      ],
    ]) ?? '',
    /장소/
  );
  assert.match(
    getCourseRequestValidationError(draft, [
      [
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
          imageKey: 'places/cafe.jpg',
        },
      ],
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
    totalDays: 1,
    transportType: 'WALK',
    companionType: 'FRIEND',
    monthStart: 4,
    monthEnd: 5,
    thumbnailKey: 'thumbnails/seoul.jpg',
    hashtagIds: [3, 7],
    courseItems: [
      {
        day: 1,
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
      { day: 1, order: 2, type: 'CONTENT', contentId: 99 },
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
    totalDays: 1,
    transportType: 'WALK',
    companionType: 'FRIEND',
    monthStart: 4,
    monthEnd: 5,
    thumbnailKey: 'thumbnails/seoul.jpg',
    hashtagIds: [3, 7],
    courseItems: [{ day: 1, order: 1, type: 'CONTENT', contentId: 99 }],
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

const createPlaceEvent = () =>
  ({
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
    imageKey: 'places/cafe.jpg',
  }) as const;

test('keeps the server hashtags when an edit could not restore them', () => {
  // 상세의 태그를 해시태그 id로 매핑하지 못한 수정 진입 — 저장을 막지 않고,
  // hashtagIds를 아예 빼서 서버의 기존 값을 그대로 둔다(PATCH는 전체 교체).
  const draft = {
    ...createDraft(),
    neighborhood: null,
    hashtagIds: [],
    editingCourseId: 42,
  };
  const visitEventsByDay = [[createPlaceEvent()]];

  assert.equal(getCourseRequestValidationError(draft, visitEventsByDay), null);

  const payload = buildLocalCourseUpdateRequest(
    draft,
    visitEventsByDay,
    undefined
  );

  assert.ok(payload);
  assert.equal('hashtagIds' in payload, false);
  assert.equal(payload.totalDays, 1);
});

test('still requires a keyword when creating a new course', () => {
  const draft = { ...createDraft(), hashtagIds: [] };

  assert.match(
    getCourseRequestValidationError(draft, [[createPlaceEvent()]]) ?? '',
    /키워드/
  );
});

test('rejects a day that has no place', () => {
  const draft = {
    ...createDraft(),
    totalDays: 2,
    basicInfo: { ...createDraft().basicInfo, duration: '1-night-2-days' },
  };

  assert.match(
    getCourseRequestValidationError(draft, [[createPlaceEvent()], []]) ?? '',
    /2일차/
  );
});
