// A single pickable region node at any depth of the backend's region
// hierarchy (시/도, 구, and whatever deeper level may be added later).
export interface Neighborhood {
  id: number;
  name: string;
  parentName: string;
}
