import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { IoSearch } from 'react-icons/io5';

import { useScaleFrame } from '../../hooks/useScaleFrame';

const SEARCH_BAR_DESIGN_WIDTH = 342;

const normalizeSearchText = (text: string) => text.replace(/\s/g, '');

export interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  label?: string;
  suggestions?: readonly string[];
  noResultsText?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onQueryChange?: (query: string) => void;
}

function SearchBar({
  initialQuery = '',
  placeholder = '검색어를 입력해 주세요',
  label = '검색어 입력',
  suggestions = [],
  noResultsText = '검색 결과가 없습니다',
  className = '',
  onSearch,
  onQueryChange,
}: SearchBarProps) {
  const { outerRef, innerRef, scale, scaledHeight } = useScaleFrame(
    SEARCH_BAR_DESIGN_WIDTH
  );
  const inputId = useId();
  const listboxId = useId();
  const searchBarRef = useRef<HTMLFormElement | null>(null);
  const [queryState, setQueryState] = useState({
    value: initialQuery,
    source: initialQuery,
  });
  const [isOpen, setIsOpen] = useState(false);
  const hasSuggestions = suggestions.length > 0;
  const query =
    queryState.source === initialQuery ? queryState.value : initialQuery;

  const updateQuery = (value: string) => {
    setQueryState({ value, source: initialQuery });
  };
  const filteredSuggestions = useMemo(() => {
    if (!hasSuggestions) {
      return [];
    }

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return suggestions.slice(0, 4);
    }

    const normalizedSearchQuery = normalizeSearchText(trimmedQuery);

    return suggestions
      .filter((suggestion) =>
        normalizeSearchText(suggestion).includes(normalizedSearchQuery)
      )
      .slice(0, 4);
  }, [hasSuggestions, query, suggestions]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (searchBarRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  const handleSuggestionSelect = (suggestion: string) => {
    const trimmedSuggestion = suggestion.trim();

    updateQuery(trimmedSuggestion);
    setIsOpen(false);
    onQueryChange?.(trimmedSuggestion);
    onSearch?.(trimmedSuggestion);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsOpen(false);
    onSearch?.(query.trim());
  };

  const handleFocus = () => {
    if (hasSuggestions) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement &&
      searchBarRef.current?.contains(nextFocusedElement)
    ) {
      return;
    }

    setIsOpen(false);
  };

  return (
    <div
      ref={outerRef}
      className={`relative w-full overflow-visible ${className}`}
      style={{ height: scaledHeight, zIndex: isOpen ? 100 : undefined }}
    >
      <div
        ref={innerRef}
        style={{
          width: SEARCH_BAR_DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <form
          ref={searchBarRef}
          role="search"
          onSubmit={handleSubmit}
          onBlur={handleBlur}
          className="relative w-full"
        >
          <label htmlFor={inputId} className="sr-only">
            {label}
          </label>
          <div className="border-gray-2 bg-pure-white flex h-[47px] w-full items-center gap-2.5 overflow-hidden rounded-xl border px-[13px]">
            <IoSearch
              aria-hidden="true"
              className="text-gray-4 shrink-0 text-[24px]"
            />

            <input
              id={inputId}
              type="search"
              value={query}
              onFocus={handleFocus}
              onChange={(event) => {
                const nextQuery = event.target.value;
                updateQuery(nextQuery);
                onQueryChange?.(nextQuery);

                if (hasSuggestions) {
                  setIsOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              role={hasSuggestions ? 'combobox' : undefined}
              aria-controls={hasSuggestions ? listboxId : undefined}
              aria-expanded={hasSuggestions ? isOpen : undefined}
              aria-autocomplete={hasSuggestions ? 'list' : undefined}
              className="text-gray-4 placeholder:text-gray-4 min-w-0 flex-1 bg-transparent text-[12px] leading-normal font-medium outline-none"
            />
          </div>
          {hasSuggestions && isOpen ? (
            <div
              id={listboxId}
              role="listbox"
              aria-label="검색어 추천 목록"
              className="absolute top-[53px] left-0 z-[100] flex w-full flex-col"
            >
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((suggestion, index) => {
                  const isFirst = index === 0;
                  const isLast = index === filteredSuggestions.length - 1;
                  const optionRadius =
                    isFirst && isLast
                      ? 'rounded-xl'
                      : isFirst
                        ? 'rounded-t-xl'
                        : isLast
                          ? 'rounded-b-xl'
                          : '';

                  return (
                    <button
                      key={suggestion}
                      type="button"
                      role="option"
                      aria-selected={query === suggestion}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={`border-gray-2 bg-pure-white text-gray-4 relative h-[47px] w-full border px-[34px] text-left text-[12px] leading-none font-medium whitespace-nowrap ${optionRadius} ${
                        index > 0 ? '-mt-px' : ''
                      }`}
                    >
                      {suggestion}
                    </button>
                  );
                })
              ) : (
                <div
                  role="option"
                  aria-selected="false"
                  className="border-gray-2 bg-pure-white text-gray-4 flex h-[47px] w-full items-center rounded-xl border px-[34px] text-[12px] leading-none font-medium whitespace-nowrap"
                >
                  {noResultsText}
                </div>
              )}
            </div>
          ) : null}{' '}
        </form>
      </div>
    </div>
  );
}

export default SearchBar;
