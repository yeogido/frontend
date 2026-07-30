import type { TravelDateRange } from '../date-selection/types';
import type { TravelFolderDecoration } from '../folder-decoration/folderDecoration';
import type { TravelRecordDraftRegion, TravelRecordFolder } from '../types';

const databaseName = 'yeogido-travel-records';
const databaseVersion = 3;
const recordStoreName = 'travel-records';
const photoDraftStoreName = 'travel-record-photo-drafts';

export const SAVED_TRAVEL_RECORD_ID_PREFIX = 'saved-';
export const TRAVEL_RECORD_PHOTO_DRAFT_ID = 'current-travel-record';

export interface CreateTravelRecordPayload {
  regionCode: string;
  regionName: string;
  startDate: Date;
  endDate: Date;
  photos: File[];
  decorations: TravelFolderDecoration[];
}

export interface SavedTravelRecordResult {
  id: string;
}

interface CreateTravelRecordDraftPayloadParams {
  selectedRegion: TravelRecordDraftRegion;
  selectedDateRange: TravelDateRange;
  selectedPhotos: File[];
  decorations: TravelFolderDecoration[];
}

interface StoredTravelRecord {
  id: string;
  regionCode: string;
  regionName: string;
  startDate: string;
  endDate: string;
  photos: File[];
  decorations?: TravelFolderDecoration[];
}

interface StoredPhotoDraft {
  id: string;
  photos: File[];
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatPeriod = (startDate: string, endDate: string) =>
  `${startDate.slice(5).replace('-', '.')} - ${endDate
    .slice(5)
    .replace('-', '.')}`;

const createRecordId = () =>
  `${SAVED_TRAVEL_RECORD_ID_PREFIX}${
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }`;

const openTravelRecordDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(recordStoreName)) {
        database.createObjectStore(recordStoreName, { keyPath: 'id' });
      }

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

const createFolder = (record: StoredTravelRecord): TravelRecordFolder | null => {
  const photoUrls = record.photos.map((photo) => URL.createObjectURL(photo));

  if (photoUrls.length === 0) {
    return null;
  }

  return {
    id: record.id,
    regionCode: record.regionCode,
    regionName: record.regionName,
    title: record.regionName,
    year: Number(record.startDate.slice(0, 4)),
    startDate: record.startDate,
    endDate: record.endDate,
    period: formatPeriod(record.startDate, record.endDate),
    photos: photoUrls as [string, ...string[]],
    decorations: normalizeStoredDecorations(record.decorations),
  };
};

export const normalizeStoredDecorations = (
  decorations: TravelFolderDecoration[] | undefined,
) => decorations ?? [];

export const revokeTravelRecordFolderPhotoUrls = (folder: TravelRecordFolder) => {
  Array.from(new Set(folder.photos)).forEach((photoUrl) =>
    URL.revokeObjectURL(photoUrl),
  );
};

export const createTravelRecordDraftPayload = ({
  selectedRegion,
  selectedDateRange,
  selectedPhotos,
  decorations,
}: CreateTravelRecordDraftPayloadParams): CreateTravelRecordPayload => ({
  regionCode: selectedRegion.id,
  regionName: selectedRegion.selectionName || selectedRegion.name,
  startDate: selectedDateRange.startDate,
  endDate: selectedDateRange.endDate,
  photos: selectedPhotos,
  decorations,
});

export const saveTravelRecordPhotoDraft = (photos: File[]) =>
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

  return draft?.photos ?? [];
};

export const clearTravelRecordPhotoDraft = () =>
  withTravelRecordDatabase((database) =>
    runTransaction(database, photoDraftStoreName, 'readwrite', (store) =>
      store.delete(TRAVEL_RECORD_PHOTO_DRAFT_ID),
    ),
  );

export const saveTravelRecord = async (
  payload: CreateTravelRecordPayload,
): Promise<SavedTravelRecordResult> => {
  const record: StoredTravelRecord = {
    id: createRecordId(),
    regionCode: payload.regionCode,
    regionName: payload.regionName,
    startDate: formatDate(payload.startDate),
    endDate: formatDate(payload.endDate),
    photos: payload.photos,
    decorations: payload.decorations,
  };

  await withTravelRecordDatabase((database) =>
    runTransaction(database, recordStoreName, 'readwrite', (store) =>
      store.put(record),
    ),
  );

  return { id: record.id };
};

export const updateTravelRecord = async (
  id: string,
  payload: CreateTravelRecordPayload,
): Promise<SavedTravelRecordResult> => {
  const record: StoredTravelRecord = {
    id,
    regionCode: payload.regionCode,
    regionName: payload.regionName,
    startDate: formatDate(payload.startDate),
    endDate: formatDate(payload.endDate),
    photos: payload.photos,
    decorations: payload.decorations,
  };

  await withTravelRecordDatabase((database) =>
    runTransaction(database, recordStoreName, 'readwrite', (store) =>
      store.put(record),
    ),
  );

  return { id };
};

export const deleteTravelRecord = (id: string) =>
  withTravelRecordDatabase((database) =>
    runTransaction(database, recordStoreName, 'readwrite', (store) =>
      store.delete(id),
    ),
  );

export const getSavedTravelRecordPhotos = async (id: string) => {
  const record = await withTravelRecordDatabase((database) =>
    runTransaction<StoredTravelRecord | undefined>(
      database,
      recordStoreName,
      'readonly',
      (store) => store.get(id),
    ),
  );

  return record?.photos ?? [];
};

export const getSavedTravelRecordFolders = async () => {
  const records = await withTravelRecordDatabase((database) =>
    runTransaction<StoredTravelRecord[]>(database, recordStoreName, 'readonly', (store) =>
      store.getAll(),
    ),
  );

  return records
    .map(createFolder)
    .filter((folder): folder is TravelRecordFolder => folder !== null);
};

export const getSavedTravelRecordFolder = async (id: string) => {
  const record = await withTravelRecordDatabase((database) =>
    runTransaction<StoredTravelRecord | undefined>(
      database,
      recordStoreName,
      'readonly',
      (store) => store.get(id),
    ),
  );

  return record ? createFolder(record) : null;
};
