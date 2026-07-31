import type { TravelFolderDecoration } from './folder-decoration/folderDecoration';

export type TravelRecordView = 'folder' | 'map';

export interface TravelRecordServerPhoto {
  imageKey: string;
  imageUrl: string;
}

export interface TravelRecordFolder {
  id: string;
  regionId?: number;
  regionCode: string;
  regionName: string;
  title: string;
  folderTheme?: string;
  year: number;
  startDate: string;
  endDate?: string;
  period: string;
  photos: [string, ...string[]];
  serverPhotos?: TravelRecordServerPhoto[];
  decorations: TravelFolderDecoration[];
  hasUnsupportedStickers?: boolean;
}

export interface TravelRecordDraftRegion {
  id: string;
  regionId?: number;
  name: string;
  province: string;
  selectionName: string;
}
