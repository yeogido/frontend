import type { TravelFolderDecoration } from './folder-decoration/folderDecoration';
import type { NicknameAvatarColor } from '../../components/common/NicknameAvatar';

export type TravelRecordView = 'folder' | 'map';
export type TravelMapViewer = 'owner' | 'shared';
export type TravelRecordVisibility = 'public' | 'friends' | 'private';
export type TravelRecordVisibilityFilter = 'all' | TravelRecordVisibility;

export interface TravelRecordServerPhoto {
  imageKey: string;
  imageUrl: string;
}

export interface TravelRecordFolder {
  version?: number;
  id: string;
  regionId?: number;
  regionCode: string;
  regionName: string;
  title: string;
  folderTheme?: string;
  startDate: string;
  endDate?: string;
  period: string;
  photos: [string, ...string[]];
  /** 원본과 분리해 미리 블러 처리한 공유 전용 썸네일. 없으면 대체 이미지를 쓴다. */
  sharedThumbnailUrl?: string;
  serverPhotos?: TravelRecordServerPhoto[];
  decorations: TravelFolderDecoration[];
  /** UI용 공개범위. 서버 응답에 없으면 임의로 분류하지 않는다. */
  visibility?: TravelRecordVisibility;
}

export interface TravelRecordInvitation {
  id: string;
  inviterName: string;
  inviterColor: NicknameAvatarColor;
  folder: TravelRecordFolder;
}

export interface TravelRecordDraftRegion {
  id: string;
  regionId?: number;
  name: string;
  province: string;
  selectionName: string;
}
