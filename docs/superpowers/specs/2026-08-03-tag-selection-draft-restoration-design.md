# Tag selection draft restoration

## Goal

When a user navigates back to `/local-recommendation/tag-selection` during the
same browser session, show the previously selected keywords and representative
image.

## Scope

- Initialize the tag selection UI from `draft.tagIds`.
- Restore the cover preview from the in-memory pending image at
  `LOCAL_RECOMMENDATION_COVER_IMAGE_ID`.
- Keep the existing delayed upload flow: files are uploaded only during final
  course registration.

## Data flow

`handleComplete` continues to store `tagIds` and `hashtagIds` in the local
recommendation draft. On a subsequent mount, the page reads the draft and the
pending-image store to initialize its local UI state. Choosing or removing a
new cover image continues to update the pending-image store.

## Error handling

Browser reload recovery remains unchanged: `File` objects cannot be restored
from persisted storage, so the existing image recovery flow still requests a
new image after reload.

## Verification

Add focused tests that demonstrate the initial UI state is derived from the
stored tag IDs and pending cover-image preview, then run the relevant test
suite and type/lint checks.
