import assert from 'node:assert/strict';
import test from 'node:test';

const storage = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

const { createEmptyLocalRecommendationDraft, useLocalRecommendationStore } =
  await import('../src/store/localRecommendation.store.ts');

test.beforeEach(() => {
  storage.clear();
  useLocalRecommendationStore.getState().resetDraft();
});

test('merges completed steps and resets a recommendation draft', () => {
  const store = useLocalRecommendationStore.getState();

  store.setTagSelection({
    tagIds: ['sea'],
    hashtagIds: [7],
    coverImageKey: 'cover-1',
  });

  assert.equal(
    useLocalRecommendationStore.getState().draft.coverImageKey,
    'cover-1'
  );

  store.resetDraft();

  assert.deepEqual(
    useLocalRecommendationStore.getState().draft,
    createEmptyLocalRecommendationDraft()
  );
});

test('persists stable draft data without retaining setter input references', () => {
  const neighborhood = {
    id: 27,
    province: 'Busan',
    city: 'Haeundae',
    district: 'U-dong',
  };
  const basicInfo = {
    courseName: 'Beach day',
    summary: 'A seaside course',
    duration: 'day-trip',
    visitStartMonth: '7',
    visitEndMonth: '8',
    transport: 'walking',
    companion: 'friends',
  } as const;
  const tagIds = ['sea'];
  const hashtagIds = [7];
  const festivals = [
    {
      id: 'festival-1',
      contentId: 20,
      tag: 'summer',
      title: 'Fireworks',
      address: 'Gwangalli',
      imageSrc: 'blob:festival-preview',
    },
  ];
  const places = [
    {
      id: 'place-1',
      title: 'Beach',
      address: 'Gwangalli',
      imageSrc: 'blob:place-preview',
      imageKey: 'place-image-1',
      externalPlaceId: 'kakao-1',
      categoryGroupCode: 'AT4',
      roadAddress: 'Gwangalli Road 1',
      lotAddress: 'Gwangalli Lot 1',
      latitude: 35.15,
      longitude: 129.11,
    },
  ];
  const visitOrder = ['place-1'];
  const store = useLocalRecommendationStore.getState();

  store.setNeighborhood(neighborhood);
  store.updateBasicInfo(basicInfo);
  store.setTagSelection({
    tagIds,
    hashtagIds,
    coverImageKey: 'cover-image-1',
  });
  store.setFestivals(festivals);
  store.setPlaces(places);
  store.setVisitOrder(visitOrder);

  neighborhood.province = 'Changed province';
  tagIds.push('city');
  hashtagIds.push(99);
  festivals[0].title = 'Changed festival';
  places[0].title = 'Changed place';
  visitOrder.push('place-2');

  const draft = useLocalRecommendationStore.getState().draft;
  const persistedDraft = JSON.parse(
    storage.get('local-recommendation-draft') ?? ''
  ).state.draft;

  assert.deepEqual(draft, {
    neighborhood: {
      id: 27,
      province: 'Busan',
      city: 'Haeundae',
      district: 'U-dong',
    },
    basicInfo,
    tagIds: ['sea'],
    hashtagIds: [7],
    coverImageKey: 'cover-image-1',
    festivals: [
      {
        id: 'festival-1',
        contentId: 20,
        tag: 'summer',
        title: 'Fireworks',
        address: 'Gwangalli',
      },
    ],
    places: [
      {
        id: 'place-1',
        title: 'Beach',
        address: 'Gwangalli',
        imageKey: 'place-image-1',
        externalPlaceId: 'kakao-1',
        categoryGroupCode: 'AT4',
        roadAddress: 'Gwangalli Road 1',
        lotAddress: 'Gwangalli Lot 1',
        latitude: 35.15,
        longitude: 129.11,
      },
    ],
    visitOrder: ['place-1'],
  });
  assert.deepEqual(persistedDraft, draft);
  assert.doesNotMatch(JSON.stringify(persistedDraft), /blob:|imageSrc/);
});
