import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createTravelRecordCreateRequest,
  createTravelRecordUpdateRequest,
  mapPopularRegionToTravelRecordRegion,
  mapRegionSearchToTravelRecordRegion,
  mapTravelRecordDetailToFolder,
  mapTravelRecordFolder,
  mapTravelRecordSummaryToFolder,
} from '../src/pages/travel-record/mappers/travelRecordApiMapper.ts';
import {
  filterTravelMapSelectableRegions,
  isTravelMapSelectableRegion,
  normalizeTravelMapSelectedRegion,
} from '../src/pages/travel-record/constants/travelRecordRegionCodes.ts';
import { getTravelRecordRegionSuggestions } from '../src/pages/travel-record/region-selection/regionSuggestions.ts';
import { getTravelRecordRegionPhotoRecords } from '../src/pages/travel-record/utils/regionPhotoRecords.ts';

import type { TravelFolderDecoration } from '../src/pages/travel-record/folder-decoration/folderDecoration.ts';
import type {
  PopularRegionResponse,
  RegionSearchResponse,
} from '../src/types/region.type.ts';
import type {
  UploadedTravelRecordImage,
  TravelRecordSummary,
  TravelRecordDetailResponse,
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

test('excludes 울산 districts from selection even without a parent region id', () => {
  // 울산은 Region API에 아직 없어 상위 지역으로 변환할 수 없다.
  // 그래도 하위 구가 선택되지는 않아야 한다.
  assert.equal(
    isTravelMapSelectableRegion({ fullName: '울산광역시 남구' }),
    false,
  );
  assert.equal(isTravelMapSelectableRegion({ fullName: '울산광역시' }), true);
});

test('keeps a region unchanged when its metropolitan parent has no region id', () => {
  const ulsanDistrict = {
    id: '900',
    regionId: 900,
    name: '남구',
    province: '울산광역시 남구',
    selectionName: '남구',
    imageSrc: '',
  };

  assert.deepEqual(normalizeTravelMapSelectedRegion(ulsanDistrict), ulsanDistrict);
});

test('maps a travel record summary cover image URL to the folder photo', () => {
  const summary: TravelRecordSummary = {
    travelRecordId: 10,
    title: 'Busan',
    regionId: 27,
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    coverImageUrl: 'https://example.com/travel-records/10/image-1.jpg',
    folderTheme: 'BASIC',
    createdAt: '2026-07-23T09:00:00',
  };

  assert.deepEqual(
    mapTravelRecordSummaryToFolder(summary, {
      name: '부산',
      fullName: '부산광역시',
    }),
    {
      id: '10',
      regionId: 27,
      regionCode: '26',
      regionName: '부산광역시',
      title: 'Busan',
      folderTheme: 'BASIC',
      year: 2026,
      startDate: '2026-07-20',
      endDate: '2026-07-22',
      period: '07.20 - 07.22',
      photos: ['https://example.com/travel-records/10/image-1.jpg'],
      decorations: [],
    },
  );
});

test('falls back to the record title for the region name when no region info is available', () => {
  const summary: TravelRecordSummary = {
    travelRecordId: 10,
    title: 'Busan',
    regionId: 27,
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    coverImageUrl: 'https://example.com/travel-records/10/image-1.jpg',
    folderTheme: 'BASIC',
    createdAt: '2026-07-23T09:00:00',
  };

  const folder = mapTravelRecordSummaryToFolder(summary);

  assert.equal(folder.regionName, 'Busan');
  assert.equal(folder.regionCode, '');
});

test('resolves a district-level region name against the city map shape', () => {
  const summary: TravelRecordSummary = {
    travelRecordId: 11,
    title: 'Yeosu trip',
    regionId: 4613,
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    coverImageUrl: 'https://example.com/travel-records/11/image-1.jpg',
    folderTheme: 'BASIC',
    createdAt: '2026-07-23T09:00:00',
  };

  const folder = mapTravelRecordSummaryToFolder(summary, {
    name: '여수시',
    fullName: '전라남도 여수시',
  });

  assert.equal(folder.regionName, '여수시');
  assert.equal(folder.regionCode, '4613');
});

const createSummaryForRegion = (regionId: number): TravelRecordSummary => ({
  travelRecordId: 12,
  title: '여행',
  regionId,
  startDate: '2026-07-20',
  endDate: '2026-07-22',
  coverImageUrl: 'https://example.com/travel-records/12/image-1.jpg',
  folderTheme: 'BASIC',
  createdAt: '2026-07-23T09:00:00',
});

test('tells apart same-named counties in different provinces', () => {
  const gangwonGoseong = mapTravelRecordSummaryToFolder(
    createSummaryForRegion(4282),
    { name: '고성군', fullName: '강원도 고성군' },
  );
  const gyeongnamGoseong = mapTravelRecordSummaryToFolder(
    createSummaryForRegion(4882),
    { name: '고성군', fullName: '경상남도 고성군' },
  );

  assert.equal(gangwonGoseong.regionCode, '4282');
  assert.equal(gyeongnamGoseong.regionCode, '4882');
});

test('matches provinces renamed to 특별자치도 against the older map data', () => {
  // 지도 데이터는 '강원도'로 남아 있지만 Region API는 개편 후 명칭을 줄 수 있다.
  const folder = mapTravelRecordSummaryToFolder(createSummaryForRegion(4282), {
    name: '고성군',
    fullName: '강원특별자치도 고성군',
  });

  assert.equal(folder.regionCode, '4282');
});

test('matches 제주 despite the misspelled province name in the map data', () => {
  const folder = mapTravelRecordSummaryToFolder(createSummaryForRegion(50), {
    name: '제주',
    fullName: '제주특별자치도',
  });

  assert.equal(folder.regionCode, '50');
});

test('leaves an ambiguous region unmatched instead of picking a wrong shape', () => {
  const folder = mapTravelRecordSummaryToFolder(createSummaryForRegion(9999), {
    name: '고성군',
    fullName: '고성군',
  });

  assert.equal(folder.regionCode, '');
});

test('keeps the server folder theme in the folder model', () => {
  const summary: TravelRecordSummary = {
    travelRecordId: 10,
    title: 'Busan',
    regionId: 27,
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    coverImageUrl: 'https://example.com/travel-records/10/image-1.jpg',
    folderTheme: 'BASIC',
    createdAt: '2026-07-23T09:00:00',
  };

  assert.equal(mapTravelRecordSummaryToFolder(summary).folderTheme, 'BASIC');
});

test('maps detail stickers into the folder displayed in the record list', () => {
  const summary: TravelRecordSummary = {
    travelRecordId: 10,
    title: 'Busan',
    regionId: 27,
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    coverImageUrl: 'https://example.com/travel-records/10/image-1.jpg',
    folderTheme: 'BASIC',
    createdAt: '2026-07-23T09:00:00',
  };
  const detail: TravelRecordDetailResponse = {
    ...summary,
    images: [],
    stickers: [
      {
        recordStickerId: 7,
        stickerId: 21,
        imageUrl: 'https://example.com/stickers/dog.png',
        positionX: 0.5,
        positionY: 0.25,
        rotation: 15,
        scale: 1.2,
        zIndex: 3,
      },
    ],
  };

  assert.deepEqual(mapTravelRecordFolder(summary, detail).decorations, [
    {
      id: '7',
      stickerId: 21,
      imageUrl: 'https://example.com/stickers/dog.png',
      x: 0.5,
      y: 0.25,
      rotation: 15,
      scale: 1.2,
      zIndex: 3,
    },
  ]);
});

test('maps detail image URLs to folder photos in image order', () => {
  const detail: TravelRecordDetailResponse = {
    travelRecordId: 10,
    title: 'Busan',
    regionId: 27,
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    coverImageUrl: 'https://example.com/travel-records/10/cover.jpg',
    folderTheme: 'BASIC',
    images: [
      {
        imageId: 2,
        imageKey: 'travel-records/10/image-2.jpg',
        imageUrl: 'https://example.com/travel-records/10/image-2.jpg',
        imageOrder: 2,
      },
      {
        imageId: 1,
        imageKey: 'travel-records/10/image-1.jpg',
        imageUrl: 'https://example.com/travel-records/10/image-1.jpg',
        imageOrder: 1,
      },
    ],
    stickers: [],
    createdAt: '2026-07-23T09:00:00',
  };

  assert.deepEqual(mapTravelRecordDetailToFolder(detail).photos, [
    'https://example.com/travel-records/10/image-1.jpg',
    'https://example.com/travel-records/10/image-2.jpg',
  ]);
  assert.deepEqual(mapTravelRecordDetailToFolder(detail).serverPhotos, [
    {
      imageKey: 'travel-records/10/image-1.jpg',
      imageUrl: 'https://example.com/travel-records/10/image-1.jpg',
    },
    {
      imageKey: 'travel-records/10/image-2.jpg',
      imageUrl: 'https://example.com/travel-records/10/image-2.jpg',
    },
  ]);
});

test('falls back to the cover image when a detail response omits images', () => {
  const detail = {
    travelRecordId: 10,
    title: 'Busan',
    regionId: 26,
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    coverImageUrl: 'https://example.com/travel-records/10/cover.jpg',
    folderTheme: 'BASIC',
    stickers: [],
    createdAt: '2026-07-23T09:00:00',
  } as TravelRecordDetailResponse;

  assert.deepEqual(mapTravelRecordDetailToFolder(detail).photos, [
    'https://example.com/travel-records/10/cover.jpg',
  ]);
});

test('handles a detail response that omits stickers', () => {
  const detail = {
    travelRecordId: 10,
    title: 'Busan',
    regionId: 26,
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    coverImageUrl: 'https://example.com/travel-records/10/cover.jpg',
    folderTheme: 'BASIC',
    images: [],
    createdAt: '2026-07-23T09:00:00',
  } as TravelRecordDetailResponse;

  assert.deepEqual(mapTravelRecordDetailToFolder(detail).decorations, []);
});

test('keeps a sticker missing from the catalog renderable through its server image URL', () => {
  const detail: TravelRecordDetailResponse = {
    travelRecordId: 10,
    title: 'Busan',
    regionId: 27,
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    coverImageUrl: 'https://example.com/travel-records/10/cover.jpg',
    folderTheme: 'BASIC',
    images: [],
    stickers: [
      {
        recordStickerId: 9,
        stickerId: 999,
        imageUrl: 'https://example.com/stickers/custom.png',
        positionX: 0.5,
        positionY: 0.25,
        rotation: 0,
        scale: 1,
        zIndex: 1,
      },
    ],
    createdAt: '2026-07-23T09:00:00',
  };

  // 논리 삭제된 커스텀 스티커는 카탈로그에 없지만 기존 기록에는 계속
  // 내려온다. 상세 응답의 imageUrl로 그리므로 그대로 표시된다.
  assert.deepEqual(mapTravelRecordDetailToFolder(detail).decorations, [
    {
      id: '9',
      stickerId: 999,
      imageUrl: 'https://example.com/stickers/custom.png',
      x: 0.5,
      y: 0.25,
      rotation: 0,
      scale: 1,
      zIndex: 1,
    },
  ]);
});

const busanDraftRegion = {
  id: '27',
  regionId: 27,
  name: 'Busan',
  province: 'Busan Metropolitan City',
  selectionName: 'Busan',
};

const createUpdateRequestParams = () => ({
  selectedRegion: busanDraftRegion,
  selectedDateRange: {
    startDate: new Date(2026, 6, 20),
    endDate: new Date(2026, 6, 22),
  },
  uploadedImages: [{ objectKey: 'travel-records/10/image-1.jpg' }],
});

test('creates a travel record update request from the edited draft data', () => {
  assert.deepEqual(
    createTravelRecordUpdateRequest({
      ...createUpdateRequestParams(),
      decorations: [],
      isStickerStateRestored: true,
    }),
    {
      title: 'Busan',
      regionId: 27,
      startDate: '2026-07-20',
      endDate: '2026-07-22',
      folderTheme: 'BASIC',
      images: [
        { imageKey: 'travel-records/10/image-1.jpg', imageOrder: 1 },
      ],
      stickers: [],
    },
  );
});

test('omits stickers when the server sticker state was never restored', () => {
  // 편집 세션이 끊긴 상태다. 빈 배열을 보내면 서버가 기존 스티커를 모두
  // 지우므로 필드 자체를 생략해 유지시킨다.
  const request = createTravelRecordUpdateRequest({
    ...createUpdateRequestParams(),
    decorations: [],
    isStickerStateRestored: false,
  });

  assert.equal('stickers' in request, false);
});

test('sends an empty sticker list when the user removed every sticker', () => {
  const request = createTravelRecordUpdateRequest({
    ...createUpdateRequestParams(),
    decorations: [],
    isStickerStateRestored: true,
  });

  assert.deepEqual(request.stickers, []);
});

test('round-trips server sticker ids without any local mapping', () => {
  const request = createTravelRecordUpdateRequest({
    ...createUpdateRequestParams(),
    decorations: [
      {
        id: 'placed-custom-sticker',
        stickerId: 999,
        imageUrl: 'https://example.com/stickers/custom.png',
        x: 0.1,
        y: 0.2,
        rotation: 0,
        scale: 1,
        zIndex: 1,
      },
    ],
    isStickerStateRestored: true,
  });

  assert.deepEqual(request.stickers, [
    {
      stickerId: 999,
      positionX: 0.1,
      positionY: 0.2,
      rotation: 0,
      scale: 1,
      zIndex: 1,
    },
  ]);
});

test('keeps the stored title when the region was not changed while editing', () => {
  const request = createTravelRecordUpdateRequest({
    ...createUpdateRequestParams(),
    decorations: [],
    isStickerStateRestored: true,
    originalTitle: '부산 감성 바다 여행',
    originalRegionId: 27,
  });

  assert.equal(request.title, '부산 감성 바다 여행');
});

test('falls back to the region name once the region is changed while editing', () => {
  const request = createTravelRecordUpdateRequest({
    ...createUpdateRequestParams(),
    decorations: [],
    isStickerStateRestored: true,
    originalTitle: '제주 겨울 여행',
    originalRegionId: 50,
  });

  assert.equal(request.title, 'Busan');
});

test('creates travel record create request from draft data and uploaded image keys', () => {
  const decorations: TravelFolderDecoration[] = [
    {
      id: 'placed-sticker',
      stickerId: 10,
      imageUrl: 'https://example.com/stickers/dog.png',
      x: 0.5,
      y: 0.25,
      rotation: 15,
      scale: 1.2,
      zIndex: 3,
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
          stickerId: 10,
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
