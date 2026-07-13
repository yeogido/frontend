export interface Neighborhood {
  id: number;
  province: string;
  city: string;
  district: string;
}

export interface PopularRegion {
  neighborhoodId: number;
  image: string;
  imageAlt: string;
}
