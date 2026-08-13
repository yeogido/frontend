import { normalizeSearchText } from '../constants';

interface RegionSuggestionListProps {
  query: string;
  suggestions: readonly string[];
  onSelect: (suggestion: string) => void;
}

function RegionSuggestionList({
  query,
  suggestions,
  onSelect,
}: RegionSuggestionListProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div
      role="listbox"
      aria-label="지역 검색 후보"
      className="absolute top-[53px] left-0 flex w-full flex-col items-start rounded-xl"
    >
      {suggestions.map((suggestion, index) => {
        const isHighlighted =
          normalizeSearchText(query) === normalizeSearchText(suggestion);
        const isFirst = index === 0;
        const isLast = index === suggestions.length - 1;

        return (
          <button
            key={suggestion}
            type="button"
            role="option"
            aria-selected={isHighlighted}
            onClick={() => onSelect(suggestion)}
            className={`border-gray-2 text-gray-4 h-[47px] w-full border-x border-t px-[33px] text-left text-[12px] leading-normal font-medium transition-colors hover:bg-gray-2 focus-visible:bg-gray-2 active:bg-gray-2 ${
              isHighlighted ? 'bg-gray-2' : 'bg-[#f9f9f9]'
            } ${isFirst ? 'rounded-t-xl' : ''} ${
              isLast ? 'rounded-b-xl border-b' : ''
            }`}
          >
            {suggestion}
          </button>
        );
      })}
    </div>
  );
}

export default RegionSuggestionList;
