import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createLocalRecommendationWithClient,
  type CreateLocalRecommendationRequest,
} from '../src/apis/localRecommendations.ts';

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
  assert.strictEqual(calls[0].body, payload);
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
