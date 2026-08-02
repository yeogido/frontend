import assert from 'node:assert/strict';
import test from 'node:test';

import { deleteTravelRecordWithClient } from '../src/apis/travelRecordsClient.ts';

test('deletes a travel record by its id', async () => {
  const calls: string[] = [];
  const client = {
    delete: async (path: string) => {
      calls.push(path);
      return { data: undefined };
    },
  };

  await deleteTravelRecordWithClient(client, 42);

  assert.deepEqual(calls, ['/travel-records/42']);
});
