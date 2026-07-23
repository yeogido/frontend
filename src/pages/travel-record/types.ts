export type TravelRecordView = 'folder' | 'map';

export interface TravelRecordFolder {
  id: string;
  regionCode: string;
  title: string;
  year: number;
  period: string;
  photos: [string, string];
}

export interface TravelRecordDraftRegion {
  id: string;
  name: string;
  province: string;
  selectionName: string;
}
