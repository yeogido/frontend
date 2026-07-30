import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createTravelRecordCreateRequest,
  getTravelRecordRegionSuggestions,
  getTravelRecordRegionPhotoRecords,
  mapPopularRegionToTravelRecordRegion,
  mapRegionSearchToTravelRecordRegion,
  mapTravelRecordSummaryToFolder,
} from '../src/pages/travel-record/mappers/travelRecordApiMapper.ts';
import {
  filterTravelMapSelectableRegions,
  isTravelMapSelectableRegion,
  normalizeTravelMapSelectedRegion,
} from '../src/pages/travel-record/constants/travelRecordRegionCodes.ts';

import type { TravelFolderDecoration } from '../src/pages/travel-record/folder-decoration/folderDecoration.ts';
import type {
  PopularRegionResponse,
  RegionSearchResponse,
} from '../src/types/region.type.ts';
import type {
  UploadedTravelRecordImage,
  TravelRecordSummary,
} from '../src/types/travelRecord.type.ts';

test('maps Region API responses to travel record selectable regions', () => {
  const popularRegion: PopularRegionResponse = {
    regionId: 26,
    name: 'Busan',
    fullName: 'Busan Metropolitan City',
    imageUrl: 'https://example.com/busan.jpg',
  };
  const searchRegion: RegionSearchResponse = {
    regionId: 5011,
    name: 'Jeju',
    fullName: 'Jeju Special Self-Governing Province',
  };

  assert.deepEqual(mapPopularRegionToTravelRecordRegion(popularRegion), {
    id: '26',
    regionId: 26,
    name: 'Busan',
    province: 'Busan Metropolitan City',
    selectionName: 'Busan',
    imageSrc: 'https://example.com/busan.jpg',
  });
  assert.deepEqual(mapRegionSearchToTravelRecordRegion(searchRegion), {
    id: '5011',
    regionId: 5011,
    name: 'Jeju',
    province: 'Jeju Special Self-Governing Province',
    selectionName: 'Jeju',
    imageSrc: '',
  });
});

test('keeps popular regions fixed while search results feed suggestions only', () => {
  const popularRegions = [
    {
      id: '26',
      regionId: 26,
      name: 'Busan',
      province: 'Busan Metropolitan City',
      selectionName: 'Busan',
      imageSrc: 'busan.jpg',
    },
  ];
  const searchedRegions = [
    {
      id: '1114',
      regionId: 1114,
      name: 'Jung-gu',
      province: 'Seoul Jung-gu',
      selectionName: 'Jung-gu',
      imageSrc: '',
    },
    {
      id: '2611',
      regionId: 2611,
      name: 'Jung-gu',
      province: 'Busan Jung-gu',
      selectionName: 'Jung-gu',
      imageSrc: '',
    },
  ];

  assert.deepEqual(
    getTravelRecordRegionSuggestions({
      query: 'Jung',
      popularRegions,
      searchedRegions,
      selectedRegion: null,
    }),
    ['Jung-gu'],
  );
  assert.deepEqual(popularRegions.map((region) => region.id), ['26']);
});

test('excludes special and metropolitan city districts from travel map selection', () => {
  const regions: RegionSearchResponse[] = [
    {
      regionId: 1114,
      name: '중구',
      fullName: '서울특별시 중구',
    },
    {
      regionId: 2611,
      name: '중구',
      fullName: '부산광역시 중구',
    },
    {
      regionId: 4418,
      name: '보령시',
      fullName: '충청남도 보령시',
    },
    {
      regionId: 36,
      name: '세종특별자치시',
      fullName: '세종특별자치시',
    },
  ];

  assert.equal(
    isTravelMapSelectableRegion({
      name: '부산광역시',
      fullName: '부산광역시',
    }),
    true,
  );
  assert.deepEqual(
    filterTravelMapSelectableRegions(regions).map((region) => region.fullName),
    ['충청남도 보령시', '세종특별자치시'],
  );
});

test('normalizes a selected popular metropolitan district to its parent region', () => {
  assert.deepEqual(
    normalizeTravelMapSelectedRegion({
      id: '34',
      regionId: 34,
      name: '중구',
      province: '부산광역시 중구',
      selectionName: '중구',
      imageSrc: 'busan-junggu.jpg',
    }),
    {
      id: '27',
      regionId: 27,
      name: '부산',
      province: '부산광역시',
      selectionName: '부산',
      imageSrc: 'busan-junggu.jpg',
    },
  );
});

test('maps travel record summaries to existing folder view model with image fallback', () => {
  const summary: TravelRecordSummary = {
    travelRecordId: 10,
    title: 'Busan',
    regionId: 27,
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    coverImageKey: 'travel-records/10/image-1.jpg',
    folderTheme: 'BASIC',
    createdAt: '2026-07-23T09:00:00',
  };

  assert.deepEqual(mapTravelRecordSummaryToFolder(summary), {
    id: '10',
    regionCode: '26',
    regionName: 'Busan',
    title: 'Busan',
    year: 2026,
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    period: '07.20 - 07.22',
    photos: [''],
    decorations: [],
  });
});

test('creates travel record create request from draft data and uploaded image keys', () => {
  const decorations: TravelFolderDecoration[] = [
    {
      id: 'known-sticker',
      source: 'sticker',
      stickerId: 'animal-dog',
      x: 0.5,
      y: 0.25,
      rotation: 15,
      scale: 1.2,
      zIndex: 3,
    },
    {
      id: 'uploaded-sticker',
      source: 'upload',
      uploadedStickerId: 'local-upload',
      x: 0.1,
      y: 0.2,
      rotation: 0,
      scale: 1,
      zIndex: 4,
    },
  ];
  const uploadedImages: UploadedTravelRecordImage[] = [
    { objectKey: 'travel-records/1/image-1.jpg' },
    { objectKey: 'travel-records/1/image-2.jpg' },
  ];

  assert.deepEqual(
    createTravelRecordCreateRequest({
      selectedRegion: {
        id: '27',
        regionId: 27,
        name: 'Busan',
        province: 'Busan Metropolitan City',
        selectionName: 'Busan',
      },
      selectedDateRange: {
        startDate: new Date(2026, 6, 20),
        endDate: new Date(2026, 6, 22),
      },
      uploadedImages,
      decorations,
    }),
    {
      title: 'Busan',
      regionId: 27,
      startDate: '2026-07-20',
      endDate: '2026-07-22',
      folderTheme: 'BASIC',
      images: [
        { imageKey: 'travel-records/1/image-1.jpg', imageOrder: 1 },
        { imageKey: 'travel-records/1/image-2.jpg', imageOrder: 2 },
      ],
      stickers: [
        {
          stickerId: 21,
          positionX: 0.5,
          positionY: 0.25,
          rotation: 15,
          scale: 1.2,
          zIndex: 3,
        },
      ],
    },
  );
});

test('uses the latest folder with a renderable first photo for map photos', () => {
  const folders = [
    {
      id: 'older',
      regionCode: '26',
      regionName: 'Busan',
      title: 'Busan',
      year: 2025,
      startDate: '2025-07-01',
      period: '07.01 - 07.02',
      photos: ['older-photo.jpg'],
      decorations: [],
    },
    {
      id: 'latest',
      regionCode: '26',
      regionName: 'Busan',
      title: 'Busan',
      year: 2026,
      startDate: '2026-07-01',
      period: '07.01 - 07.02',
      photos: ['latest-photo.jpg'],
      decorations: [],
    },
    {
      id: 'no-photo-url',
      regionCode: '11',
      regionName: 'Seoul',
      title: 'Seoul',
      year: 2026,
      startDate: '2026-07-01',
      period: '07.01 - 07.02',
      photos: [''],
      decorations: [],
    },
  ] as const;

  assert.deepEqual(getTravelRecordRegionPhotoRecords(folders), [
    {
      regionName: 'Busan',
      photoUrl: 'latest-photo.jpg',
      folderId: 'latest',
    },
  ]);
});
