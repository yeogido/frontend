import { IoSearch } from 'react-icons/io5';

interface RegionSearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onFocus: () => void;
}

function RegionSearchInput({
  query,
  onQueryChange,
  onFocus,
}: RegionSearchInputProps) {
  return (
    <>
      <label htmlFor="travel-record-region-search" className="sr-only">
        지역명 또는 도시명 검색
      </label>
      <div className="border-gray-2 flex h-[47px] items-center gap-2.5 overflow-hidden rounded-xl border bg-[#f9f9f9] px-[13px]">
        <IoSearch
          aria-hidden="true"
          className="text-gray-4 shrink-0 text-[24px]"
        />
        <input
          id="travel-record-region-search"
          type="search"
          value={query}
          onFocus={onFocus}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="지역명 또는 도시명을 검색해 주세요"
          autoComplete="off"
          className="text-gray-4 placeholder:text-gray-4 min-w-0 flex-1 bg-transparent text-[12px] leading-none font-medium outline-none"
        />
      </div>
    </>
  );
}

export default RegionSearchInput;
