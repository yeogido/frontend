import { useId, useMemo, useRef, useState } from 'react';
import { IoSearch } from 'react-icons/io5';

import closeRounded from '../../../assets/icons/close-rounded.svg';

const SUGGESTION_LIMIT = 4;

const normalizeSearchText = (text: string) => text.replace(/\s/g, '');

interface DesktopSearchFieldProps {
  placeholder: string;
  label: string;
  /** 입력할 때마다 호출한다 — 디바운스는 받는 쪽 훅이 맡는다. */
  onQueryChange: (query: string) => void;
  /** 주면 Enter에서 호출한다. 한글 조합 중의 Enter는 조합이 끝난 뒤 한 번만 호출한다. */
  onEnter?: () => void;
  /** 입력창에 포커스하면 후보를 보여준다. 기본은 입력과 맞는 것만 최대 4개. */
  suggestions?: readonly string[];
  /**
   * false면 받은 후보를 그대로 보여준다 — 서버가 이미 입력에 맞춰 골라 준
   * 결과(지역 검색)는 글자가 포함돼 있지 않아도 유효한 후보라 걸러내면 안 된다.
   */
  filterSuggestions?: boolean;
  /** 주면 후보를 눌렀을 때 입력을 바꾸는 대신 이걸 호출한다. */
  onSuggestionSelect?: (suggestion: string) => void;
  /** 부모가 입력값을 비워야 할 때(선택 완료 등) 바꿔서 리셋한다. */
  resetKey?: string | number;
}

/**
 * 데스크톱 검색 입력. 모바일 SearchBar는 342px 기준폭에 맞춰 컨테이너
 * 폭만큼 비례 확대하는 구조라 넓은 칼럼에 넣으면 부풀어서, 시안 치수로
 * 따로 둔다. 입력·후보·지우기 동작은 같다.
 */
function DesktopSearchField({
  placeholder,
  label,
  onQueryChange,
  onEnter,
  suggestions = [],
  filterSuggestions = true,
  onSuggestionSelect,
  resetKey,
}: DesktopSearchFieldProps) {
  const inputId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const shouldSelectAfterCompositionRef = useRef(false);
  const skipEnterKeyUpRef = useRef(false);
  const [state, setState] = useState({ value: '', resetKey });
  const [isOpen, setIsOpen] = useState(false);
  const query = state.resetKey === resetKey ? state.value : '';

  const updateQuery = (value: string) => {
    setState({ value, resetKey });
    onQueryChange(value);
  };

  const filteredSuggestions = useMemo(() => {
    if (suggestions.length === 0) return [];
    if (!filterSuggestions) return suggestions.slice(0, SUGGESTION_LIMIT);

    const trimmed = query.trim();
    if (!trimmed) return suggestions.slice(0, SUGGESTION_LIMIT);

    const normalized = normalizeSearchText(trimmed);

    return suggestions
      .filter((item) => normalizeSearchText(item).includes(normalized))
      .slice(0, SUGGESTION_LIMIT);
  }, [query, suggestions, filterSuggestions]);

  const isListOpen = isOpen && filteredSuggestions.length > 0;

  const handleClear = () => {
    updateQuery('');
    inputRef.current?.focus();
  };

  return (
    <div
      className="relative z-20 w-full"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setIsOpen(false);
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="border-gray-2 bg-pure-white relative flex h-[48px] w-full items-center gap-[10px] rounded-[12px] border px-[16px]">
        <IoSearch
          aria-hidden="true"
          className="text-gray-4 shrink-0 text-[24px]"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          role={suggestions.length > 0 ? 'combobox' : undefined}
          aria-controls={suggestions.length > 0 ? listboxId : undefined}
          aria-expanded={suggestions.length > 0 ? isListOpen : undefined}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            updateQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsOpen(false);
              return;
            }

            if (event.key !== 'Enter' || !onEnter) return;

            if (event.nativeEvent.isComposing) {
              shouldSelectAfterCompositionRef.current = true;
              return;
            }

            event.preventDefault();
            skipEnterKeyUpRef.current = true;
            onEnter();
          }}
          onKeyUp={(event) => {
            if (event.key !== 'Enter' || !onEnter) return;

            // keydown에서 이미 처리한 Enter다. 조합 플래그가 남아 있어도
            // 한 번 더 실행하지 않도록 플래그째 정리한다.
            if (skipEnterKeyUpRef.current) {
              skipEnterKeyUpRef.current = false;
              shouldSelectAfterCompositionRef.current = false;
              return;
            }

            if (!shouldSelectAfterCompositionRef.current) return;

            shouldSelectAfterCompositionRef.current = false;
            event.preventDefault();
            onEnter();
          }}
          className="text-gray-5 placeholder:text-gray-4 min-w-0 flex-1 bg-transparent pr-[32px] text-[16px] font-medium outline-none"
        />
        {query ? (
          <button
            type="button"
            // blur보다 먼저 눌려야 해서 mousedown에서 포커스 이동을 막는다.
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
            aria-label="검색어 지우기"
            className="absolute right-[8px] flex size-[32px] items-center justify-center"
          >
            <img
              src={closeRounded}
              alt=""
              aria-hidden="true"
              className="size-[16px]"
            />
          </button>
        ) : null}
      </div>

      {isListOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="검색어 추천 목록"
          className="absolute top-[56px] left-0 z-[100] flex w-full flex-col"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              role="option"
              aria-selected={query === suggestion}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setIsOpen(false);

                if (onSuggestionSelect) {
                  onSuggestionSelect(suggestion);
                  return;
                }

                updateQuery(suggestion);
              }}
              className={`border-gray-2 bg-pure-white text-gray-4 hover:bg-gray-2 h-[48px] w-full border px-[16px] text-left text-[16px] font-medium ${
                index > 0 ? '-mt-px' : ''
              } ${index === 0 ? 'rounded-t-[12px]' : ''} ${
                index === filteredSuggestions.length - 1
                  ? 'rounded-b-[12px]'
                  : ''
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default DesktopSearchField;
