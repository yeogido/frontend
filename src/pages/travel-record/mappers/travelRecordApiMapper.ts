import { findMapRegion } from '../../home/map/utils/regionCodeLookup.ts';
import type {
  PopularRegionResponse,
  RegionDetailResponse,
  RegionSearchResponse,
} from '../../../types/region.type';
import type {
  TravelRecordCreateRequest,
  TravelRecordDetailResponse,
  TravelRecordImageRequest,
  TravelRecordImageResponse,
  TravelRecordStickerRequest,
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

const getSelectedRegionId = (selectedRegion: TravelRecordDraftRegion) =>
  selectedRegion.regionId ?? Number(selectedRegion.id);

const createTravelRecordImageRequests = (
  uploadedImages: UploadedTravelRecordImage[],
): TravelRecordImageRequest[] =>
  uploadedImages.map((image, index) => ({
    imageKey: image.objectKey,
    imageOrder: index + 1,
  }));

const createTravelRecordStickerRequests = (
  decorations: TravelFolderDecoration[],
): TravelRecordStickerRequest[] =>
  decorations.flatMap((decoration) => {
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
  });

export const createTravelRecordCreateRequest = ({
  selectedRegion,
  selectedDateRange,
  uploadedImages,
  decorations,
}: CreateTravelRecordCreateRequestParams): TravelRecordCreateRequest => ({
  title: selectedRegion.name,
  regionId: getSelectedRegionId(selectedRegion),
  startDate: formatTravelRecordLocalDate(selectedDateRange.startDate),
  endDate: formatTravelRecordLocalDate(selectedDateRange.endDate),
  folderTheme: defaultFolderTheme,
  images: createTravelRecordImageRequests(uploadedImages),
  stickers: createTravelRecordStickerRequests(decorations),
});

interface CreateTravelRecordUpdateRequestParams
  extends CreateTravelRecordCreateRequestParams {
  /** 서버에 저장돼 있던 스티커를 실제로 복원한 상태인지. */
  isStickerStateRestored: boolean;
  /** 서버에 저장돼 있던 제목. */
  originalTitle?: string;
  /** 서버에 저장돼 있던 지역 ID. */
  originalRegionId?: number;
}

export const createTravelRecordUpdateRequest = ({
  selectedRegion,
  selectedDateRange,
  uploadedImages,
  decorations,
  isStickerStateRestored,
  originalTitle,
  originalRegionId,
}: CreateTravelRecordUpdateRequestParams): TravelRecordUpdateRequest => {
  const regionId = getSelectedRegionId(selectedRegion);
  const stickers = createTravelRecordStickerRequests(decorations);
  // 서버는 stickers를 생략하면 기존 스티커를 유지하고, 빈 배열이면 전부
  // 삭제한다. 편집 세션이 끊겨 복원하지 못했거나 서버가 내려준 스티커를
  // 하나도 변환하지 못한 상태에서 빈 배열을 보내면, 저장돼 있던 스티커가
  // 사용자가 지운 적도 없는데 통째로 사라진다.
  const hasUnconvertedStickers =
    stickers.length === 0 &&
    decorations.some((decoration) => decoration.source === 'sticker');
  const keepsServerStickers = !isStickerStateRestored || hasUnconvertedStickers;

  return {
    // 제목 입력 화면이 없어 생성 시에는 지역명을 제목으로 쓴다. 수정하면서
    // 지역을 바꾸지 않았다면 서버에 저장된 제목을 그대로 되돌려 보낸다.
    title:
      originalTitle && regionId === originalRegionId
        ? originalTitle
        : selectedRegion.name,
    regionId,
    startDate: formatTravelRecordLocalDate(selectedDateRange.startDate),
    endDate: formatTravelRecordLocalDate(selectedDateRange.endDate),
    folderTheme: defaultFolderTheme,
    images: createTravelRecordImageRequests(uploadedImages),
    ...(keepsServerStickers ? {} : { stickers }),
  };
};
