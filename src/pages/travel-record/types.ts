export type TravelRecordView = 'folder' | 'map';

export interface TravelRecordFolder {
  id: string;
  regionCode: string;
  regionName: string;
  title: string;
  year: number;
  startDate: string;
  period: string;
  photos: [string, string, ...string[]];
}

export interface TravelRecordDraftRegion {
  id: string;
  name: string;
  province: string;
  selectionName: string;
}
