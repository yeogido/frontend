export interface Region {
  regionId: number;
  name: string;
  imageUrl: string;
}

export interface GetRegionsResponse {
  regions: Region[];
}

export interface RegionDetailResponse {
  regionId: number;
  name: string;
  fullName: string;
  imageUrl: string;
}

export interface SubRegionPreview {
  subRegionId: number;
  name: string;
}

export interface SubRegionListResponse {
  subRegions: SubRegionPreview[];
}

export interface RegionSearchResponse {
  regionId: number;
  name: string;
  fullName: string;
}

export interface PopularRegionResponse {
  regionId: number;
  name: string;
  fullName: string;
  imageUrl: string;
}
