import type { TravelFolderDecoration } from './folder-decoration/folderDecoration';

export type TravelRecordView = 'folder' | 'map';

export interface TravelRecordFolder {
  id: string;
  regionCode: string;
  regionName: string;
  title: string;
  year: number;
  startDate: string;
  endDate?: string;
  period: string;
  photos: [string, ...string[]];
  decorations: TravelFolderDecoration[];
}

export interface TravelRecordDraftRegion {
  id: string;
  regionId?: number;
  name: string;
  province: string;
  selectionName: string;
}
