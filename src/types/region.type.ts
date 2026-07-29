export interface Region {
  regionId: number;
  name: string;
  imageUrl: string;
}

export interface GetRegionsResponse {
  regions: Region[];
}