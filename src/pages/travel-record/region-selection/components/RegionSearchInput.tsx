import { useRef } from 'react';
import { IoSearch } from 'react-icons/io5';

import closeRounded from '../../../../assets/icons/close-rounded.svg';

interface RegionSearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onFocus: () => void;
  onEnter?: () => void;
}

function RegionSearchInput({
  query,
  onQueryChange,
  onFocus,
  onEnter,
}: RegionSearchInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const shouldSelectAfterCompositionRef = useRef(false);
  const skipEnterKeyUpRef = useRef(false);

  const handleClear = () => {
    onQueryChange('');
    inputRef.current?.focus();
  };

  return (
    <>
      <label htmlFor="travel-record-region-search" className="sr-only">
        지역명 또는 도시명 검색
      </label>
      <div className="border-gray-2 relative flex h-[47px] items-center gap-2.5 overflow-hidden rounded-xl border bg-[#f9f9f9] px-[13px]">
        <IoSearch
          aria-hidden="true"
          className="text-gray-4 shrink-0 text-[24px]"
        />
        <input
          ref={inputRef}
          id="travel-record-region-search"
          type="search"
          value={query}
          onFocus={onFocus}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || !onEnter) {
              return;
            }

            if (event.nativeEvent.isComposing) {
              shouldSelectAfterCompositionRef.current = true;
              return;
            }

            event.preventDefault();
            skipEnterKeyUpRef.current = true;
            onEnter();
          }}
          onKeyUp={(event) => {
            if (event.key !== 'Enter' || !onEnter) {
              return;
            }

            // keydown에서 이미 처리한 Enter다. 조합 플래그가 남아 있더라도
            // 여기서 한 번 더 실행하면 안 되므로 플래그째 정리하고 끝낸다.
            if (skipEnterKeyUpRef.current) {
              skipEnterKeyUpRef.current = false;
              shouldSelectAfterCompositionRef.current = false;
              return;
            }

            if (!shouldSelectAfterCompositionRef.current) {
              return;
            }

            shouldSelectAfterCompositionRef.current = false;
            event.preventDefault();
            onEnter();
          }}
          placeholder="지역명 또는 도시명을 검색해 주세요"
          autoComplete="off"
          className="text-gray-4 placeholder:text-gray-4 min-w-0 flex-1 bg-transparent pr-9 text-[12px] leading-none font-medium outline-none"
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
    </>
  );
}

export default RegionSearchInput;
