const normalizeRegionSearchText = (text: string) => text.replace(/\s/g, '');

interface GetTravelRecordRegionSuggestionsParams {
  query: string;
  searchedRegions: readonly { selectionName: string }[];
  selectedRegion: unknown;
}

export const getTravelRecordRegionSuggestions = ({
  query,
  searchedRegions,
  selectedRegion,
}: GetTravelRecordRegionSuggestionsParams) => {
  const normalizedQuery = normalizeRegionSearchText(query.trim());

  if (!normalizedQuery || selectedRegion) {
    return [];
  }

  return Array.from(
    new Set(
      searchedRegions
        .map((region) => region.selectionName)
        .filter((suggestion) =>
          normalizeRegionSearchText(suggestion).includes(normalizedQuery),
        ),
    ),
  );
};
