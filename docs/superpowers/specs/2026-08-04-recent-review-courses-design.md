# Recent Review Courses Design

## Scope

Add a recent-review-course listing page at `/recent-review-courses`. Change the home review section's "전체보기" action to this route. Keep `/review` as the existing review-writing page.

## Page

The page uses the standard main layout and header. Its content begins with the title "최근 후기" and the subtitle "최근 등록된 여행 후기를 모아봤어요", followed by a vertically spaced list of cards. The Figma reference node is `642:3514`.

## Shared component

Create `CourseReviewCard` under `src/components/common` and export it from the common component barrel. The card combines:

- course thumbnail, title, duration, travel method, companion, tags, and like affordance;
- reviewer avatar, name/metadata, five-star rating, and a two-line review excerpt.

It will follow the existing `CourseCard`, `ReviewCard`, and `TagChip` APIs and scaling approach. Existing local assets and shared components are preferred whenever their visual output matches the Figma design.

## Data and interactions

The initial UI uses page-local mock display data, matching the current home review-section approach. Course-card and like callbacks remain optional props, so later API integration can supply navigation and mutation behavior without changing the UI component.

## Errors and validation

No API request is introduced. The page must render safely when images or optional callbacks are absent, and controls retain accessible labels.

## Tests

Add focused unit tests for the route and the shared card's required course/review content. Run the relevant test suite, lint, and production build.
