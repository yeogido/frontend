# Local course detail mock data

## Goal

Make the local-course detail page render every existing detail section for one mock course: course overview, route map, stop list, and reviews.

## Scope

- Keep the existing local-course preview cards and route selection behavior.
- Enrich `mapLocalCourseToDetailDto` with one shared mock itinerary containing three stops, valid coordinates, travel labels, and two reviews.
- Continue passing the mapped result through the existing `mapCourseDetailDtoToViewModel` and `CourseDetailLayout`.

## Data flow

`LocalCourse` preview -> `mapLocalCourseToDetailDto` -> `CourseDetailDto` -> `mapCourseDetailDtoToViewModel` -> `CourseDetailLayout`.

The mapper supplies the detail-only fields that previews do not contain. Existing course-specific fields (title, image, tags, duration, course type, companion, and liked state) remain sourced from the selected preview card.

## UI behavior

- Route-map markers and path render from the three mock stops and their coordinates.
- The stop list renders the same three stops, including their travel-to-next labels.
- The review section renders the two mock reviews.
- Favorite and stop-like interactions remain handled by `CourseDetailLayout`; no interaction behavior changes.

## Error handling and tests

No new failure path is introduced. A mapper-focused test will assert that its output includes populated stops and reviews so the detail layout receives the data necessary to render all sections.
