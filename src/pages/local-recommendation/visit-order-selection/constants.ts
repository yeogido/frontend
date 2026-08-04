// ponytail: the store never persists blob/object URLs (see
// localRecommendation.store.ts), so a real per-item photo isn't available on
// this page — every card uses the shared fallback thumbnail. Upgrade path:
// cache uploaded previews (e.g. keyed by imageKey) if per-item photos matter.
export type VisitEvent =
  | {
      id: string;
      kind: 'PLACE';
      name: string;
      address: string;
      imageSrc: string;
      externalPlaceId: string;
      categoryGroupCode: string;
      roadAddress: string;
      lotAddress: string;
      latitude: number;
      longitude: number;
      imageKey: string | null;
    }
  | {
      id: string;
      kind: 'CONTENT';
      name: string;
      address: string;
      imageSrc: string;
      contentId: number;
    };
