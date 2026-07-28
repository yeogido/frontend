import type { TravelFolderDecoration } from './folder-decoration/folderDecoration';

export type TravelRecordView = 'folder' | 'map';

export interface TravelRecordFolder {
  id: string;
  regionCode: string;
  regionName: string;
  title: string;
  year: number;
  startDate: string;
  period: string;
  photos: [string, ...string[]];
  decorations: TravelFolderDecoration[];
}

export interface TravelRecordDraftRegion {
  id: string;
  name: string;
  province: string;
  selectionName: string;
}
