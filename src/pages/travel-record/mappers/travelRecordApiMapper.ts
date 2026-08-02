import { findMapRegion } from '../../home/map/utils/regionCodeLookup.ts';
import type {
  PopularRegionResponse,
  RegionDetailResponse,
  RegionSearchResponse,
} from '../../../types/region.type';
import type {
  TravelRecordCreateRequest,
  TravelRecordDetailResponse,
  TravelRecordImageResponse,
  TravelRecordSummary,
  TravelRecordUpdateRequest,
  UploadedTravelRecordImage,
} from '../../../types/travelRecord.type';
import type { TravelDateRange } from '../date-selection/types';
import type { TravelFolderDecoration } from '../folder-decoration/folderDecoration';
import type {
  TravelRecordDraftRegion,
  TravelRecordFolder,
} from '../types';
import {
  BACKEND_STICKER_ID_TO_FRONTEND_ID,
  FRONTEND_STICKER_ID_TO_BACKEND_ID,
} from '../constants/travelRecordStickerIds.ts';
import { formatTravelRecordLocalDate } from '../utils/sessionFolders.ts';

type TravelRecordRegionInfo = Pick<RegionDetailResponse, 'name' | 'fullName'>;

const resolveTravelRecordMapRegion = (
  fallbackName: string,
  regionInfo?: TravelRecordRegionInfo,
) => {
  const match = findMapRegion({
    name: regionInfo?.name,
    fullName: regionInfo?.fullName,
  });

  return {
    regionName: match?.name ?? fallbackName,
    regionCode: match?.code ?? '',
  };
};

const fallbackPhotoUrl = '';
const defaultFolderTheme = 'BASIC';

const formatPeriod = (startDate: string, endDate: string) =>
  `${startDate.slice(5).replace('-', '.')} - ${endDate
    .slice(5)
    .replace('-', '.')}`;

const getRegionProvince = (fullName?: string, name?: string) =>
  fullName && name && fullName !== name ? fullName : name ?? '';

export const mapPopularRegionToTravelRecordRegion = (
  region: PopularRegionResponse,
) => ({
  id: String(region.regionId),
  regionId: region.regionId,
  name: region.name,
  province: getRegionProvince(region.fullName, region.name),
  selectionName: region.name,
  imageSrc: region.imageUrl,
});

export const mapRegionSearchToTravelRecordRegion = (
  region: RegionSearchResponse,
) => ({
  id: String(region.regionId),
  regionId: region.regionId,
  name: region.name,
  province: getRegionProvince(region.fullName, region.name),
  selectionName: region.name,
  imageSrc: '',
});

const getRenderablePhotos = (
  images: TravelRecordImageResponse[],
  coverImageUrl?: string,
): [string, ...string[]] => {
  const photos = images
    .filter((image) => image.imageUrl)
    .sort(
      (currentImage, nextImage) =>
        currentImage.imageOrder - nextImage.imageOrder,
    )
    .map((image) => image.imageUrl);

  if (photos.length > 0) {
    return photos as [string, ...string[]];
  }

  if (coverImageUrl) {
    return [coverImageUrl];
  }

  return [fallbackPhotoUrl];
};

export const mapTravelRecordSummaryToFolder = (
  record: TravelRecordSummary,
  regionInfo?: TravelRecordRegionInfo,
): TravelRecordFolder => ({
  id: String(record.travelRecordId),
  regionId: record.regionId,
  ...resolveTravelRecordMapRegion(record.title, regionInfo),
  title: record.title,
  folderTheme: record.folderTheme,
  year: Number(record.startDate.slice(0, 4)),
  startDate: record.startDate,
  endDate: record.endDate,
  period: formatPeriod(record.startDate, record.endDate),
  photos: record.coverImageUrl ? [record.coverImageUrl] : [fallbackPhotoUrl],
  decorations: [],
});

export const mapTravelRecordDetailToFolder = (
  record: TravelRecordDetailResponse,
  regionInfo?: TravelRecordRegionInfo,
): TravelRecordFolder => {
  const stickers = Array.isArray(record.stickers) ? record.stickers : [];
  const images = Array.isArray(record.images) ? record.images : [];
  const serverPhotos = images
    .filter((image) => image.imageUrl)
    .sort(
      (currentImage, nextImage) =>
        currentImage.imageOrder - nextImage.imageOrder,
    )
    .map((image) => ({
      imageKey: image.imageKey,
      imageUrl: image.imageUrl,
    }));

  return {
    id: String(record.travelRecordId),
    regionId: record.regionId,
    ...resolveTravelRecordMapRegion(record.title, regionInfo),
    title: record.title,
    folderTheme: record.folderTheme,
    year: Number(record.startDate.slice(0, 4)),
    startDate: record.startDate,
    endDate: record.endDate,
    period: formatPeriod(record.startDate, record.endDate),
    photos: getRenderablePhotos(images, record.coverImageUrl),
    serverPhotos,
    decorations: stickers.map((sticker) => ({
      id: String(sticker.recordStickerId),
      source: 'sticker' as const,
      stickerId: BACKEND_STICKER_ID_TO_FRONTEND_ID[sticker.stickerId],
      backendStickerId: sticker.stickerId,
      imageUrl: sticker.imageUrl,
      x: sticker.positionX,
      y: sticker.positionY,
      rotation: sticker.rotation,
      scale: sticker.scale,
      zIndex: sticker.zIndex,
    })),
  };
};

export const mapTravelRecordFolder = (
  summary: TravelRecordSummary,
  detail?: TravelRecordDetailResponse,
  regionInfo?: TravelRecordRegionInfo,
) =>
  detail
    ? mapTravelRecordDetailToFolder(detail, regionInfo)
    : mapTravelRecordSummaryToFolder(summary, regionInfo);

interface CreateTravelRecordCreateRequestParams {
  selectedRegion: TravelRecordDraftRegion;
  selectedDateRange: TravelDateRange;
  uploadedImages: UploadedTravelRecordImage[];
  decorations: TravelFolderDecoration[];
}

export const createTravelRecordCreateRequest = ({
  selectedRegion,
  selectedDateRange,
  uploadedImages,
  decorations,
}: CreateTravelRecordCreateRequestParams): TravelRecordCreateRequest => ({
  title: selectedRegion.name,
  regionId: selectedRegion.regionId ?? Number(selectedRegion.id),
  startDate: formatTravelRecordLocalDate(selectedDateRange.startDate),
  endDate: formatTravelRecordLocalDate(selectedDateRange.endDate),
  folderTheme: defaultFolderTheme,
  images: uploadedImages.map((image, index) => ({
    imageKey: image.objectKey,
    imageOrder: index + 1,
  })),
  stickers: decorations.flatMap((decoration) => {
    if (decoration.source !== 'sticker') {
      return [];
    }

    const stickerId =
      decoration.backendStickerId ??
      (decoration.stickerId
        ? FRONTEND_STICKER_ID_TO_BACKEND_ID[decoration.stickerId]
        : undefined);

    if (!stickerId) {
      return [];
    }

    return {
      stickerId,
      positionX: decoration.x,
      positionY: decoration.y,
      rotation: decoration.rotation,
      scale: decoration.scale,
      zIndex: decoration.zIndex,
    };
  }),
});

export const createTravelRecordUpdateRequest = (
  params: CreateTravelRecordCreateRequestParams,
): TravelRecordUpdateRequest => createTravelRecordCreateRequest(params);
