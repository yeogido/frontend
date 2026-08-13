// ponytail: PLACE images depend on pendingImages/place.imageUrl set at
// place-selection — a freshly picked place without an uploaded photo yet
// falls back to the shared thumbnail (store never persists blob/object
// URLs, see localRecommendation.store.ts). CONTENT (festival) images are
// persisted as imageSrc from event-selection and only fall back when the
// API didn't return a thumbnail.
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
