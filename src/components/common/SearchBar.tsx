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

import closeRounded from '../../assets/icons/close-rounded.svg';
import { useScaleFrame } from '../../hooks/useScaleFrame';

const SEARCH_BAR_DESIGN_WIDTH = 342;

const normalizeSearchText = (text: string) => text.replace(/\s/g, '');

export interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  label?: string;
  suggestions?: readonly string[];
  noResultsText?: string;
  hideEmptySuggestions?: boolean;
  pinnedSuggestion?: {
    label: string;
    onSelect: () => void;
  };
  onRemoveSuggestion?: (suggestion: string) => void;
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
  hideEmptySuggestions = false,
  pinnedSuggestion,
  onRemoveSuggestion,
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [queryState, setQueryState] = useState({
    value: initialQuery,
    source: initialQuery,
  });
  const hasSuggestions = suggestions.length > 0;
  const hasMenuItems = hasSuggestions || pinnedSuggestion !== undefined;
  // 마운트 시에는 항상 닫아 둔다. 열어서 시작하면 '전국 확인하기'처럼 결과를
  // 보러 이동한 화면이 드롭다운에 가려진 채 랜딩한다. 목록은 입력창을
  // 포커스할 때(handleFocus) 연다.
  const [isOpen, setIsOpen] = useState(false);
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
    if (hasMenuItems) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    updateQuery('');
    onQueryChange?.('');
    inputRef.current?.focus();
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
          <div className="border-gray-2 bg-pure-white relative flex h-[47px] w-full items-center gap-2.5 overflow-hidden rounded-xl border px-[13px]">
            <IoSearch
              aria-hidden="true"
              className="text-gray-4 shrink-0 text-[24px]"
            />

            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={query}
              onFocus={handleFocus}
              onChange={(event) => {
                const nextQuery = event.target.value;
                updateQuery(nextQuery);
                onQueryChange?.(nextQuery);

                if (hasMenuItems) {
                  setIsOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              role={hasMenuItems ? 'combobox' : undefined}
              aria-controls={hasMenuItems ? listboxId : undefined}
              aria-expanded={hasMenuItems ? isOpen : undefined}
              aria-autocomplete={hasMenuItems ? 'list' : undefined}
              className="text-gray-4 placeholder:text-gray-4 min-w-0 flex-1 bg-transparent pr-9 text-[12px] leading-normal font-medium outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="검색어 지우기"
                className="absolute right-[5px] flex size-11 items-center justify-center"
              >
                <img
                  src={closeRounded}
                  alt=""
                  aria-hidden="true"
                  className="size-4"
                />
              </button>
            ) : null}
          </div>
          {hasMenuItems &&
          isOpen &&
          (pinnedSuggestion ||
            filteredSuggestions.length > 0 ||
            !hideEmptySuggestions) ? (
            <div
              id={listboxId}
              role="listbox"
              aria-label="검색어 추천 목록"
              className="absolute top-[53px] left-0 z-[100] flex w-full flex-col"
            >
              {pinnedSuggestion ? (
                <button
                  type="button"
                  role="option"
                  aria-selected="false"
                  onClick={() => {
                    setIsOpen(false);
                    pinnedSuggestion.onSelect();
                  }}
                  className={`border-gray-2 bg-pure-white text-main-5 relative h-[47px] w-full border px-[34px] text-left text-[12px] leading-none font-medium whitespace-nowrap ${
                    filteredSuggestions.length > 0 || !hideEmptySuggestions
                      ? 'rounded-t-xl'
                      : 'rounded-xl'
                  }`}
                >
                  {pinnedSuggestion.label}
                </button>
              ) : null}
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((suggestion, index) => {
                  const isFirst = index === 0 && !pinnedSuggestion;
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
                    // option은 내부의 인터랙티브 요소를 접근성 트리에 노출하지
                    // 않는다. 행 전체를 option으로 삼으면 삭제 버튼이 가려지고
                    // 선택 버튼도 활성화 대상으로 잡히지 않으므로, 껍데기는
                    // role="none"으로 비우고 선택 버튼 자체를 option으로 둔다.
                    <div
                      key={suggestion}
                      role="none"
                      className={`border-gray-2 bg-pure-white text-gray-4 relative flex h-[47px] w-full items-center border text-[12px] leading-none font-medium whitespace-nowrap ${optionRadius} ${
                        index > 0 || pinnedSuggestion ? '-mt-px' : ''
                      }`}
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={query === suggestion}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="h-full min-w-0 flex-1 px-[34px] pr-[16px] text-left"
                      >
                        {suggestion}
                      </button>
                      {onRemoveSuggestion ? (
                        <button
                          type="button"
                          aria-label={`${suggestion} 최근 검색어 삭제`}
                          onClick={() => onRemoveSuggestion(suggestion)}
                          className="absolute right-[5px] flex size-11 items-center justify-center"
                        >
                          <img
                            src={closeRounded}
                            alt=""
                            aria-hidden="true"
                            className="size-4"
                          />
                        </button>
                      ) : null}
                    </div>
                  );
                })
              ) : !hideEmptySuggestions ? (
                <div
                  role="option"
                  aria-selected="false"
                  aria-disabled="true"
                  className={`border-gray-2 bg-pure-white text-gray-4 flex h-[47px] w-full items-center border px-[34px] text-[12px] leading-none font-medium whitespace-nowrap ${
                    pinnedSuggestion ? 'rounded-b-xl -mt-px' : 'rounded-xl'
                  }`}
                >
                  {noResultsText}
                </div>
              ) : null}
            </div>
          ) : null}{' '}
        </form>
      </div>
    </div>
  );
}

export default SearchBar;
