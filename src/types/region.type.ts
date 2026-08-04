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

export interface SubRegion {
  subRegionId: number;
  name: string;
}

export type SubRegionPreview = SubRegion;

export interface GetSubRegionsResponse {
  subRegions: SubRegion[];
}

export type SubRegionListResponse = GetSubRegionsResponse;

export interface RegionSearchResult {
  regionId: number;
  name: string;
  fullName: string;
}

export type RegionSearchResponse = RegionSearchResult;

export interface PopularRegionResponse {
  regionId: number;
  name: string;
  fullName: string;
  imageUrl: string;
}
