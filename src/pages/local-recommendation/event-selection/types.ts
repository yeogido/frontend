export interface FestivalApiItem {
  id: string;
  tag: string;
  title: string;
  address: string;
}

export interface FestivalItem extends FestivalApiItem {
  imageSrc: string | null;
}
