import assert from 'node:assert/strict';
import test from 'node:test';

// 저장소 키가 로그인 여부·계정별로 갈리므로(`recent-courses`,
// `recent-courses:{userId}`) 삭제가 모든 키를 훑는지 검증한다. 한 키만
// 지우면 로그인 상태가 바뀌는 순간 삭제한 항목이 되살아난다.
const store = new Map<string, string>();

(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    get length() {
      return store.size;
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  },
  dispatchEvent: () => true,
};

(globalThis as unknown as { Event: unknown }).Event = class {
  type: string;

  constructor(type: string) {
    this.type = type;
  }
};

const { removeRecentCourse, RECENT_COURSES_STORAGE_KEY } = await import(
  '../src/utils/recentCourses.ts'
);
const {
  removeRecentCultureContent,
  RECENT_CULTURE_CONTENTS_STORAGE_KEY,
} = await import('../src/utils/recentCultureContents.ts');

const idsIn = (key: string, idField: 'courseId' | 'contentId') =>
  (JSON.parse(store.get(key) ?? '[]') as Record<string, number>[]).map(
    (item) => item[idField]
  );

test('removes a deleted course from every account list', () => {
  store.clear();
  store.set(RECENT_COURSES_STORAGE_KEY, JSON.stringify([{ courseId: 28 }]));
  store.set(
    `${RECENT_COURSES_STORAGE_KEY}:1`,
    JSON.stringify([{ courseId: 28 }, { courseId: 25 }])
  );
  store.set(`${RECENT_COURSES_STORAGE_KEY}:2`, JSON.stringify([{ courseId: 28 }]));

  removeRecentCourse(28);

  assert.deepEqual(idsIn(RECENT_COURSES_STORAGE_KEY, 'courseId'), []);
  assert.deepEqual(idsIn(`${RECENT_COURSES_STORAGE_KEY}:1`, 'courseId'), [25]);
  assert.deepEqual(idsIn(`${RECENT_COURSES_STORAGE_KEY}:2`, 'courseId'), []);
});

test('leaves unrelated storage keys untouched when removing a course', () => {
  store.clear();
  store.set(RECENT_COURSES_STORAGE_KEY, JSON.stringify([{ courseId: 28 }]));
  store.set('other-storage', JSON.stringify([{ courseId: 28 }]));

  removeRecentCourse(28);

  assert.deepEqual(idsIn('other-storage', 'courseId'), [28]);
});

test('removes a deleted culture content from every account list', () => {
  store.clear();
  store.set(
    RECENT_CULTURE_CONTENTS_STORAGE_KEY,
    JSON.stringify([{ contentId: 7 }])
  );
  store.set(
    `${RECENT_CULTURE_CONTENTS_STORAGE_KEY}:1`,
    JSON.stringify([{ contentId: 7 }, { contentId: 9 }])
  );

  removeRecentCultureContent(7);

  assert.deepEqual(idsIn(RECENT_CULTURE_CONTENTS_STORAGE_KEY, 'contentId'), []);
  assert.deepEqual(
    idsIn(`${RECENT_CULTURE_CONTENTS_STORAGE_KEY}:1`, 'contentId'),
    [9]
  );
});

test('keeps stored lists intact when the id is not present', () => {
  store.clear();
  store.set(RECENT_COURSES_STORAGE_KEY, JSON.stringify([{ courseId: 25 }]));

  removeRecentCourse(28);

  assert.deepEqual(idsIn(RECENT_COURSES_STORAGE_KEY, 'courseId'), [25]);
});
