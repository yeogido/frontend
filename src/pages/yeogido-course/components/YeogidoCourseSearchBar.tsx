import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { IoSearch } from 'react-icons/io5';

const searchSuggestions = [
  '강릉 혼자 여행 코스',
  '강릉 바다 산책 코스',
  '강릉 카페 투어',
  '부산 감성 여행',
  '부산 바다 코스',
  '제주 힐링 여행',
  '제주 오름 산책',
  '순천 힐링 여행',
  '보령 바다 여행',
  '뚜벅이 당일치기',
  '혼자 떠나는 여행',
  '가족과 함께하는 코스',
];

const normalizeSearchText = (text: string) => text.replace(/\s/g, '');

interface YeogidoCourseSearchBarProps {
  initialQuery?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  showSuggestions?: boolean;
}

function YeogidoCourseSearchBar({
  initialQuery = '',
  className = '',
  onSearch,
  onQueryChange,
  placeholder = '코스명 또는 지역명을 검색해 주세요',
  ariaLabel = '코스명 또는 지역명 검색',
  showSuggestions = true,
}: YeogidoCourseSearchBarProps) {
  const inputId = useId();
  const listboxId = useId();
  const searchBarRef = useRef<HTMLFormElement | null>(null);
  const [queryState, setQueryState] = useState({
    value: initialQuery,
    syncedInitialQuery: initialQuery,
  });
  const [isOpen, setIsOpen] = useState(false);

  if (queryState.syncedInitialQuery !== initialQuery) {
    setQueryState({
      value: initialQuery,
      syncedInitialQuery: initialQuery,
    });
  }

  const query =
    queryState.syncedInitialQuery === initialQuery
      ? queryState.value
      : initialQuery;

  const updateQuery = (value: string) => {
    setQueryState({
      value,
      syncedInitialQuery: initialQuery,
    });
  };

  const filteredSuggestions = useMemo(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return searchSuggestions.slice(0, 4);
    }

    const normalizedSearchQuery = normalizeSearchText(normalizedQuery);

    return searchSuggestions
      .filter((suggestion) =>
        normalizeSearchText(suggestion).includes(normalizedSearchQuery)
      )
      .slice(0, 4);
  }, [query]);

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
    onSearch?.(trimmedSuggestion);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsOpen(false);
    onSearch?.(query.trim());
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
    <form
      ref={searchBarRef}
      role="search"
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      className={`relative w-full max-w-[342px] ${className}`}
    >
      <label htmlFor={inputId} className="sr-only">
        {ariaLabel}
      </label>

      <div className="border-gray-2 bg-pure-white flex h-[47px] w-full items-center gap-2 overflow-hidden rounded-xl border px-3.5">
        <IoSearch
          aria-hidden="true"
          className="text-gray-4 shrink-0 text-[18px]"
        />

        <input
          id={inputId}
          type="search"
          value={query}
          onFocus={() => setIsOpen(showSuggestions)}
          onChange={(event) => {
            const nextQuery = event.target.value;

            updateQuery(nextQuery);
            onQueryChange?.(nextQuery);
            setIsOpen(showSuggestions);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-controls={showSuggestions ? listboxId : undefined}
          aria-expanded={showSuggestions && isOpen}
          aria-autocomplete="list"
          className="text-gray-4 placeholder:text-gray-4 min-w-0 flex-1 bg-transparent text-[12px] leading-none font-medium outline-none"
        />
      </div>

      {showSuggestions && isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="검색어 추천 목록"
          className="absolute top-[53px] left-0 z-30 flex w-full flex-col"
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
              검색 결과가 없습니다
            </div>
          )}
        </div>
      ) : null}
    </form>
  );
}

export default YeogidoCourseSearchBar;
