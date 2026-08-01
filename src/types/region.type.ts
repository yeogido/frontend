export interface Region {
  regionId: number;
  name: string;
  imageUrl: string;
}

export interface GetRegionsResponse {
  regions: Region[];
}

export interface SubRegion {
  subRegionId: number;
  name: string;
}

export interface GetSubRegionsResponse {
  subRegions: SubRegion[];
}

export interface RegionSearchResult {
  regionId: number;
  name: string;
  fullName: string;
}
