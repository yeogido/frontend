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
    name: 'Busan',
    parentName: '',
  };
  const basicInfo = {
    courseName: 'Beach day',
    summary: 'A seaside course',
    duration: 'day-trip',
    visitStartMonth: '7',
    visitEndMonth: '8',
    transport: 'walking',
    companion: 'friends',
  };
  const tagIds = ['sea'];
  const hashtagIds = [7];
  const festivals = [
    {
      id: 'festival-1',
      contentId: 20,
      tag: 'summer',
      title: 'Fireworks',
      address: 'Gwangalli',
      imageSrc: 'https://tong.visitkorea.or.kr/cms/resource/festival.jpg',
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
  const visitOrder = [['place-1']];
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

  neighborhood.name = 'Changed name';
  basicInfo.courseName = 'Changed course name';
  tagIds.push('city');
  hashtagIds.push(99);
  festivals[0].title = 'Changed festival';
  places[0].title = 'Changed place';
  visitOrder[0].push('place-2');

  const draft = useLocalRecommendationStore.getState().draft;
  const persistedDraft = JSON.parse(
    storage.get('local-recommendation-draft') ?? ''
  ).state.draft;

  assert.deepEqual(draft, {
    neighborhood: {
      id: 27,
      name: 'Busan',
      parentName: '',
    },
    basicInfo: {
      courseName: 'Beach day',
      summary: 'A seaside course',
      duration: 'day-trip',
      visitStartMonth: '7',
      visitEndMonth: '8',
      transport: 'walking',
      companion: 'friends',
    },
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
        imageSrc: 'https://tong.visitkorea.or.kr/cms/resource/festival.jpg',
      },
    ],
    places: [
      {
        id: 'place-1',
        title: 'Beach',
        address: 'Gwangalli',
        imageKey: 'place-image-1',
        imageUrl: null,
        externalPlaceId: 'kakao-1',
        categoryGroupCode: 'AT4',
        roadAddress: 'Gwangalli Road 1',
        lotAddress: 'Gwangalli Lot 1',
        latitude: 35.15,
        longitude: 129.11,
      },
    ],
    visitOrder: [['place-1']],
    // day-trip이라 1일차뿐이다.
    totalDays: 1,
    editingCourseId: null,
    existingThumbnailUrl: null,
    dirtyFields: { basicInfo: true, tags: true, courseItems: true },
  });
  assert.deepEqual(persistedDraft, draft);
  assert.doesNotMatch(JSON.stringify(persistedDraft), /blob:/);
});

const basicInfo = {
  courseName: 'Jeju trip',
  summary: 'Two easy days.',
  duration: '1-night-2-days' as const,
  visitStartMonth: '4' as const,
  visitEndMonth: '5' as const,
  transport: 'walking' as const,
  companion: 'solo' as const,
};

test('keeps the duration in step when a day is added', () => {
  const store = useLocalRecommendationStore.getState();
  store.updateBasicInfo(basicInfo);
  store.setVisitOrder([['place-1'], ['place-2']]);

  useLocalRecommendationStore.getState().setTotalDays(3);

  const draft = useLocalRecommendationStore.getState().draft;
  assert.equal(draft.totalDays, 3);
  // 3일 = 2박 3일. 일수와 기간이 어긋나면 서버가 거절한다.
  assert.equal(draft.basicInfo?.duration, '2-nights-3-days');
  // 늘어난 일차는 빈 자리로 생긴다.
  assert.deepEqual(draft.visitOrder, [['place-1'], ['place-2'], []]);
  assert.equal(draft.dirtyFields.courseItems, true);
  assert.equal(draft.dirtyFields.basicInfo, true);
});

test('drops a removed schedule from both the pool and the day order', () => {
  const store = useLocalRecommendationStore.getState();
  store.setPlaces([
    {
      id: 'place-1',
      title: 'Cafe',
      address: '1 Road',
      imageKey: null,
      imageUrl: null,
      externalPlaceId: 'place-1',
      categoryGroupCode: 'CE7',
      roadAddress: '1 Road',
      lotAddress: '',
      latitude: 37.5,
      longitude: 127,
    },
  ]);
  useLocalRecommendationStore
    .getState()
    .setVisitOrder([['place-1', 'festival-1']]);

  useLocalRecommendationStore.getState().removeVisitEvent('place-1');

  const draft = useLocalRecommendationStore.getState().draft;
  assert.deepEqual(draft.places, []);
  assert.deepEqual(draft.visitOrder, [['festival-1']]);
});

test('ignores a removal for a schedule the draft does not hold', () => {
  const before = useLocalRecommendationStore.getState().draft;

  useLocalRecommendationStore.getState().removeVisitEvent('unknown');

  assert.equal(useLocalRecommendationStore.getState().draft, before);
});
