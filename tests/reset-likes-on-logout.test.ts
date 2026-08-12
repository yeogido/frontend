import assert from 'node:assert/strict';
import test from 'node:test';

const storage = new Map<string, string>();

Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: globalThis,
});

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

const {
  clearStoredContentLikeOverrides,
  getStoredContentLikeOverrides,
  setStoredContentLikeOverride,
} = await import('../src/utils/contentLikeOverrides.ts');
const {
  clearRecentCoursesLikedState,
  getStoredRecentCourses,
  RECENT_COURSES_STORAGE_KEY,
} = await import('../src/utils/recentCourses.ts');
const {
  clearRecentCultureContentsLikedState,
  getStoredRecentCultureContents,
  RECENT_CULTURE_CONTENTS_STORAGE_KEY,
} = await import('../src/utils/recentCultureContents.ts');

test.beforeEach(() => {
  storage.clear();
});

test('clearStoredContentLikeOverrides removes the content like override backup entirely', () => {
  setStoredContentLikeOverride(1, true);
  setStoredContentLikeOverride(2, false);

  clearStoredContentLikeOverrides();

  assert.deepEqual(getStoredContentLikeOverrides(), {});
});

test('clearRecentCoursesLikedState unsets isLiked on every recent course but keeps the list', () => {
  storage.set(
    RECENT_COURSES_STORAGE_KEY,
    JSON.stringify([
      {
        courseId: 1,
        title: '코스 1',
        thumbnailUrl: '',
        region: '서울',
        durationType: 'DAY_TRIP',
        transportType: 'WALK',
        companionType: 'SOLO',
        tags: [],
        isLiked: true,
        courseType: 'LOCAL',
      },
      {
        courseId: 2,
        title: '코스 2',
        thumbnailUrl: '',
        region: '부산',
        durationType: 'DAY_TRIP',
        transportType: 'WALK',
        companionType: 'SOLO',
        tags: [],
        isLiked: false,
        courseType: 'OFFICIAL',
      },
    ])
  );

  clearRecentCoursesLikedState();

  const courses = getStoredRecentCourses();
  assert.equal(courses.length, 2);
  assert.deepEqual(
    courses.map((course) => course.isLiked),
    [false, false]
  );
});

test('clearRecentCultureContentsLikedState unsets liked on every recent content but keeps the list', () => {
  storage.set(
    RECENT_CULTURE_CONTENTS_STORAGE_KEY,
    JSON.stringify([
      {
        contentId: 1,
        title: '행사 1',
        thumbnailImageUrl: '',
        regionName: '서울',
        hashtags: [],
        startDate: '2026-07-30',
        endDate: '2026-07-30',
        liked: true,
      },
    ])
  );

  clearRecentCultureContentsLikedState();

  const contents = getStoredRecentCultureContents();
  assert.equal(contents.length, 1);
  assert.equal(contents[0].liked, false);

  // 표시용으로 "YYYY.MM"까지만 자른 날짜가 저장소에 그대로 다시 쓰여서는
  // 안 된다 — 원본 일자(day) 정보가 사라지는 회귀를 막는다.
  const storedRaw = JSON.parse(
    storage.get(RECENT_CULTURE_CONTENTS_STORAGE_KEY) ?? '[]'
  );
  assert.equal(storedRaw[0].startDate, '2026-07-30');
  assert.equal(storedRaw[0].endDate, '2026-07-30');
});
