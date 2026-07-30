# Local Recommendation Draft Persistence Design

## Goal

Preserve every in-progress local recommendation field across route changes and browser refreshes, then submit it once from the visit-order screen.

## Storage Boundaries

- A new Zustand store owns the draft state shared by all local-recommendation routes.
- Zustand `persist` stores JSON-compatible values in `localStorage`: course basics, region, tag IDs, selected festival IDs, selected place metadata, image keys, and visit order.
- The browser's existing IndexedDB style is reused for actual `File` objects: the cover image and one image per selected place.
- The store never persists `File`, `Blob`, object URLs, React state, or UI-only fields.

## Data Flow

1. Each step initializes from the persisted draft and writes its completed values before navigating forward or backward.
2. Image selection writes the file to IndexedDB and writes only a stable image key to the Zustand draft.
3. The visit-order page reads its sortable items from the draft, and records every completed reorder.
4. The final submit operation builds one JSON request for `POST /api/v1/courses` and prevents concurrent submission.
5. A successful POST clears both the Zustand draft and its IndexedDB records, then navigates to the success destination. A failed POST leaves both intact for retry.

## API Boundary

`apis/localRecommendations.ts` exposes `createLocalRecommendation(payload)`. It posts JSON through the existing Axios client to `/api/v1/courses` using the backend fields `title`, `regionId`, `description`, enum values, months, `thumbnailKey`, `hashtagIds`, and ordered `courseItems`. Local IndexedDB file keys remain separate from remote storage keys.

## Error Handling

- Missing required persisted fields or missing indexed files block final submission and present an actionable error.
- IndexedDB read/write failures do not clear the current draft.
- A failed POST does not invoke either cleanup operation.

## Testing

- Unit-test JSON draft merging, reset behavior, and request-data construction.
- Unit-test the IndexedDB draft adapter's save, read, and clear behavior with a browser database mock.
- Verify final registration calls cleanup only after a successful request.

## Scope

This change does not add cross-device drafts, a server-side draft API, or automatic cleanup of abandoned browser drafts.
