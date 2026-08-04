const normalizeRegionSearchText = (text: string) => text.replace(/\s/g, '');

interface GetTravelRecordRegionSuggestionsParams {
  query: string;
  popularRegions: readonly { selectionName: string }[];
  searchedRegions: readonly { selectionName: string }[];
  selectedRegion: unknown;
}

export const getTravelRecordRegionSuggestions = ({
  query,
  popularRegions,
  searchedRegions,
  selectedRegion,
}: GetTravelRecordRegionSuggestionsParams) => {
  const normalizedQuery = normalizeRegionSearchText(query.trim());

  if (!normalizedQuery || selectedRegion) {
    return [];
  }

  const suggestionSource =
    searchedRegions.length > 0 ? searchedRegions : popularRegions;

  return Array.from(
    new Set(
      suggestionSource
        .map((region) => region.selectionName)
        .filter((suggestion) =>
          normalizeRegionSearchText(suggestion).includes(normalizedQuery),
        ),
    ),
  );
};
