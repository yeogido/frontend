export interface LabelOffset {
  x: number;
  y: number;
}

export const LABEL_OFFSETS: Record<string, LabelOffset> = {
  서울특별시: { x: 0, y: 0 },
  인천광역시: { x: 0, y: -10 },
  경기도: { x: 0, y: 20 },
  충청북도: { x: -5, y: 0 },
};