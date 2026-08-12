export const shouldOpenSuggestionsOnMount = (
  openSuggestionsOnMount: boolean,
  initialQuery: string,
  hasMenuItems: boolean
) => openSuggestionsOnMount && initialQuery.trim().length === 0 && hasMenuItems;
