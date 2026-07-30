import type { RegionRecordPhoto } from '../../home/map/types/regionPhoto';
import type {
  PopularRegionResponse,
  RegionSearchResponse,
} from '../../../types/region.type';
import type {
  TravelRecordCreateRequest,
  TravelRecordDetailResponse,
  TravelRecordSummary,
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
import { getTravelRecordRegionCode } from '../constants/travelRecordRegionCodes.ts';
import { formatTravelRecordLocalDate } from '../utils/sessionFolders.ts';

const fallbackPhotoUrl = '';
const defaultFolderTheme = 'BASIC';
const normalizeRegionSearchText = (text: string) => text.replace(/\s/g, '');

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

interface GetTravelRecordRegionSuggestionsParams {
  query: string;
  popularRegions: readonly { selectionName: string }[];
  searchedRegions: readonly { selectionName: string }[];
  selectedRegion: unknown;
}

export const getTravelRecordRegionSuggestions = ({
  query,
  popularRegions,
  searchedRegions,
  selectedRegion,
}: GetTravelRecordRegionSuggestionsParams) => {
  const normalizedQuery = normalizeRegionSearchText(query.trim());

  if (!normalizedQuery || selectedRegion) {
    return [];
  }

  const suggestionSource =
    searchedRegions.length > 0 ? searchedRegions : popularRegions;

  return Array.from(
    new Set(
      suggestionSource
        .map((region) => region.selectionName)
        .filter((suggestion) =>
          normalizeRegionSearchText(suggestion).includes(normalizedQuery),
        ),
    ),
  );
};

const getRenderablePhotos = (
  images: { imageUrl?: string; imageOrder: number }[],
  coverImageUrl?: string,
): [string, ...string[]] => {
  const photos = images
    .filter((image) => image.imageUrl)
    .sort(
      (currentImage, nextImage) =>
        currentImage.imageOrder - nextImage.imageOrder,
    )
    .map((image) => image.imageUrl as string);

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
): TravelRecordFolder => ({
  id: String(record.travelRecordId),
  regionCode: getTravelRecordRegionCode(record.regionId),
  regionName: record.title,
  title: record.title,
  year: Number(record.startDate.slice(0, 4)),
  startDate: record.startDate,
  endDate: record.endDate,
  period: formatPeriod(record.startDate, record.endDate),
  photos: record.coverImageUrl ? [record.coverImageUrl] : [fallbackPhotoUrl],
  decorations: [],
});

export const mapTravelRecordDetailToFolder = (
  record: TravelRecordDetailResponse,
): TravelRecordFolder => ({
  id: String(record.travelRecordId),
  regionCode: getTravelRecordRegionCode(record.regionId),
  regionName: record.title,
  title: record.title,
  year: Number(record.startDate.slice(0, 4)),
  startDate: record.startDate,
  endDate: record.endDate,
  period: formatPeriod(record.startDate, record.endDate),
  photos: getRenderablePhotos(record.images, record.coverImageUrl),
  decorations: record.stickers.flatMap((sticker) => {
    const stickerId = BACKEND_STICKER_ID_TO_FRONTEND_ID[sticker.stickerId];

    if (!stickerId) {
      return [];
    }

    return {
      id: String(sticker.recordStickerId),
      source: 'sticker' as const,
      stickerId,
      x: sticker.positionX,
      y: sticker.positionY,
      rotation: sticker.rotation,
      scale: sticker.scale,
      zIndex: sticker.zIndex,
    };
  }),
});

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
    if (decoration.source !== 'sticker' || !decoration.stickerId) {
      return [];
    }

    const stickerId = FRONTEND_STICKER_ID_TO_BACKEND_ID[decoration.stickerId];

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

export const getTravelRecordRegionPhotoRecords = (
  folders: readonly TravelRecordFolder[],
): RegionRecordPhoto[] => {
  const latestFoldersByRegion = new Map<string, TravelRecordFolder>();

  folders.forEach((folder) => {
    if (!folder.regionCode || !folder.photos[0]) {
      return;
    }

    const currentFolder = latestFoldersByRegion.get(folder.regionCode);

    if (
      !currentFolder ||
      folder.startDate.localeCompare(currentFolder.startDate) > 0
    ) {
      latestFoldersByRegion.set(folder.regionCode, folder);
    }
  });

  return Array.from(latestFoldersByRegion.values()).map((folder) => ({
    regionName: folder.regionName,
    photoUrl: folder.photos[0],
    folderId: folder.id,
  }));
};
