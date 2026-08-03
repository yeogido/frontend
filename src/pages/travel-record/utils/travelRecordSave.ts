const databaseName = 'yeogido-travel-records';
const databaseVersion = 3;
const photoDraftStoreName = 'travel-record-photo-drafts';

export const TRAVEL_RECORD_PHOTO_DRAFT_ID = 'current-travel-record';

export type TravelRecordPhotoDraft =
  | { source: 'new'; file: File }
  | { source: 'server'; imageKey: string; imageUrl: string };

interface StoredPhotoDraft {
  id: string;
  photos: Array<TravelRecordPhotoDraft | File>;
}

const openTravelRecordDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(photoDraftStoreName)) {
        database.createObjectStore(photoDraftStoreName, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withTravelRecordDatabase = async <Result>(
  operation: (database: IDBDatabase) => Promise<Result>,
) => {
  const database = await openTravelRecordDatabase();

  try {
    return await operation(database);
  } finally {
    database.close();
  }
};

const runTransaction = <Result>(
  database: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<Result>,
) =>
  new Promise<Result>((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = operation(transaction.objectStore(storeName));
    let result: Result;

    request.onsuccess = () => {
      result = request.result;
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

export const saveTravelRecordPhotoDraft = (photos: TravelRecordPhotoDraft[]) =>
  withTravelRecordDatabase((database) =>
    runTransaction(database, photoDraftStoreName, 'readwrite', (store) =>
      store.put({ id: TRAVEL_RECORD_PHOTO_DRAFT_ID, photos } satisfies StoredPhotoDraft),
    ),
  );

export const getTravelRecordPhotoDraft = async () => {
  const draft = await withTravelRecordDatabase((database) =>
    runTransaction<StoredPhotoDraft | undefined>(
      database,
      photoDraftStoreName,
      'readonly',
      (store) => store.get(TRAVEL_RECORD_PHOTO_DRAFT_ID),
    ),
  );

  return (draft?.photos ?? []).flatMap((photo) => {
    if (photo instanceof File) {
      return [{ source: 'new' as const, file: photo }];
    }

    return photo.source === 'server' || photo.source === 'new' ? [photo] : [];
  });
};

export const clearTravelRecordPhotoDraft = () =>
  withTravelRecordDatabase((database) =>
    runTransaction(database, photoDraftStoreName, 'readwrite', (store) =>
      store.delete(TRAVEL_RECORD_PHOTO_DRAFT_ID),
    ),
  );
