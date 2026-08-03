import assert from 'node:assert/strict';
import test from 'node:test';

import { collectTravelRecords } from '../src/pages/travel-record/utils/collectTravelRecords.ts';

import type {
  TravelRecordListResponse,
  TravelRecordSummary,
} from '../src/types/travelRecord.type.ts';

const createRecord = (travelRecordId: number): TravelRecordSummary => ({
  travelRecordId,
  title: '여행',
  regionId: 1,
  startDate: '2026-07-20',
  endDate: '2026-07-22',
  coverImageUrl: `https://example.com/travel-records/${travelRecordId}.jpg`,
  folderTheme: 'BASIC',
  createdAt: '2026-07-23T09:00:00',
});

const createPageFetcher = (pages: TravelRecordListResponse[]) => {
  const requestedCursors: Array<number | undefined> = [];
  let pageIndex = 0;

  return {
    requestedCursors,
    fetchPage: async (cursor: number | undefined) => {
      requestedCursors.push(cursor);

      // 페이지를 다 쓰면 마지막 응답을 계속 돌려준다. 멈추지 못하는 구현이면
      // 테스트가 무한히 도는 대신 요청 횟수로 드러난다.
      return pages[Math.min(pageIndex++, pages.length - 1)];
    },
  };
};

test('follows the cursor until the server reports no next page', async () => {
  const { fetchPage, requestedCursors } = createPageFetcher([
    { items: [createRecord(30), createRecord(20)], cursorId: 20, hasNext: true },
    { items: [createRecord(10)], cursorId: 10, hasNext: false },
  ]);

  const records = await collectTravelRecords(fetchPage);

  assert.deepEqual(
    records.map((record) => record.travelRecordId),
    [30, 20, 10],
  );
  // 첫 요청은 커서 없이, 다음 요청은 직전 페이지의 커서로 나간다.
  assert.deepEqual(requestedCursors, [undefined, 20]);
});

test('stops when the server reports a next page without a cursor', async () => {
  // 그대로 반복하면 같은 페이지를 무한히 받게 된다.
  const { fetchPage, requestedCursors } = createPageFetcher([
    { items: [createRecord(30)], cursorId: null, hasNext: true },
  ]);

  const records = await collectTravelRecords(fetchPage);

  assert.deepEqual(
    records.map((record) => record.travelRecordId),
    [30],
  );
  assert.equal(requestedCursors.length, 1);
});

test('stops when the server keeps returning a cursor it already handed out', async () => {
  // 서버가 hasNext와 함께 같은 커서를 계속 돌려주면 따라갈수록 같은 페이지만
  // 받는다. 멈추지 못하면 지도 쿼리가 영원히 완료되지 않는다.
  const { fetchPage, requestedCursors } = createPageFetcher([
    { items: [createRecord(30)], cursorId: 20, hasNext: true },
    { items: [createRecord(20)], cursorId: 20, hasNext: true },
  ]);

  const records = await collectTravelRecords(fetchPage);

  // 커서 20으로 한 번 더 요청한 뒤 멈춘다. 세 번째 요청은 나가지 않는다.
  assert.deepEqual(requestedCursors, [undefined, 20]);
  assert.deepEqual(
    records.map((record) => record.travelRecordId),
    [30, 20],
  );
});

test('returns an empty list when the year has no records', async () => {
  const { fetchPage } = createPageFetcher([
    { items: [], cursorId: null, hasNext: false },
  ]);

  assert.deepEqual(await collectTravelRecords(fetchPage), []);
});
