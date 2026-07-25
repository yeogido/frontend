import type { TravelDateRange } from '../date-selection/types';
import type { TravelRecordDraftRegion, TravelRecordFolder } from '../types';

const databaseName = 'yeogido-travel-records';
const databaseVersion = 1;
const recordStoreName = 'travel-records';

export interface CreateTravelRecordPayload {
  regionCode: string;
  regionName: string;
  startDate: Date;
  endDate: Date;
  photos: File[];
}

export interface SavedTravelRecordResult {
  id: string;
}

interface CreateTravelRecordDraftPayloadParams {
  selectedRegion: TravelRecordDraftRegion;
  selectedDateRange: TravelDateRange;
  selectedPhotos: File[];
}

interface StoredTravelRecord {
  id: string;
  regionCode: string;
  regionName: string;
  startDate: string;
  endDate: string;
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
  `saved-${
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
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const createFolder = (record: StoredTravelRecord): TravelRecordFolder | null => {
  const photoUrls = record.photos.map((photo) => URL.createObjectURL(photo));
  const firstPhoto = photoUrls[0];

  if (!firstPhoto) {
    return null;
  }

  return {
    id: record.id,
    regionCode: record.regionCode,
    regionName: record.regionName,
    title: record.regionName,
    year: Number(record.startDate.slice(0, 4)),
    startDate: record.startDate,
    period: formatPeriod(record.startDate, record.endDate),
    photos: [firstPhoto, photoUrls[1] ?? firstPhoto, ...photoUrls.slice(2)],
  };
};

export const revokeTravelRecordFolderPhotoUrls = (folder: TravelRecordFolder) => {
  Array.from(new Set(folder.photos)).forEach((photoUrl) =>
    URL.revokeObjectURL(photoUrl),
  );
};

export const createTravelRecordDraftPayload = ({
  selectedRegion,
  selectedDateRange,
  selectedPhotos,
}: CreateTravelRecordDraftPayloadParams): CreateTravelRecordPayload => ({
  regionCode: selectedRegion.id,
  regionName: selectedRegion.selectionName || selectedRegion.name,
  startDate: selectedDateRange.startDate,
  endDate: selectedDateRange.endDate,
  photos: selectedPhotos,
});

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
  };
  const database = await openTravelRecordDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(recordStoreName, 'readwrite');
    const request = transaction.objectStore(recordStoreName).put(record);

    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();

  return { id: record.id };
};

export const getSavedTravelRecordFolders = async () => {
  const database = await openTravelRecordDatabase();

  const records = await new Promise<StoredTravelRecord[]>((resolve, reject) => {
    const transaction = database.transaction(recordStoreName, 'readonly');
    const request = transaction.objectStore(recordStoreName).getAll();

    request.onsuccess = () => resolve(request.result as StoredTravelRecord[]);
    request.onerror = () => reject(request.error);
  });
  database.close();

  return records
    .map(createFolder)
    .filter((folder): folder is TravelRecordFolder => folder !== null);
};

export const getSavedTravelRecordFolder = async (id: string) => {
  const database = await openTravelRecordDatabase();

  const record = await new Promise<StoredTravelRecord | undefined>(
    (resolve, reject) => {
      const transaction = database.transaction(recordStoreName, 'readonly');
      const request = transaction.objectStore(recordStoreName).get(id);

      request.onsuccess = () =>
        resolve(request.result as StoredTravelRecord | undefined);
      request.onerror = () => reject(request.error);
    },
  );
  database.close();

  return record ? createFolder(record) : null;
};