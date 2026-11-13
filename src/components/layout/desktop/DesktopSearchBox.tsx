import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MdClose } from 'react-icons/md';
import { useLocation } from 'react-router-dom';

import searchIcon from '../../../assets/icons/search.svg';
import useCourseRegionSearch from '../../../pages/course-region-search/hooks/useCourseRegionSearch';

// Figma 1440 데스크톱 시안(6363:44551 검색창) 기준 리터럴 px.
const PANEL_WIDTH = 522;
const CITY_SIZE = 56;

/**
 * 데스크톱 헤더의 검색창. 누르면 최근 검색·도시·시군구 선택 패널이 열리고,
 * 글을 입력해 엔터를 치면 자연어 검색, 지역을 고르면 지역 결과로 간다.
 * 모바일 검색 화면(/course-region-search)과 같은 훅을 쓴다.
 */
function SearchBox() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const {
    cities,
    isRegionError,
    isRegionLoading,
    recentSearches,
    searchSuggestions,
    selectedCity,
    selectedCityId,
    visibleDistricts,
    searchPlaceholder,
    clearRecentSearches,
    removeRecentSearch,
    selectCity,
    selectDistrict,
    selectRecentSearch,
    submitSearch,
    updateSearchQuery,
  } = useCourseRegionSearch('home');
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleChange = (value: string) => {
    setQuery(value);
    updateSearchQuery(value);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (trimmedQuery) submitSearch(trimmedQuery);
  };

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={handleSubmit}
        role="search"
        className="border-gray-2 flex w-[clamp(150px,19.58vw,282px)] items-center justify-between gap-[8px] rounded-full border bg-white px-[16px] py-[10px] max-[1199px]:w-[44px] max-[1199px]:justify-center max-[1199px]:px-[10px]"
      >
        <input
          type="text"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="검색어를 입력해 주세요"
          aria-label="코스 또는 지역 검색"
          className="text-gray-5 placeholder:text-gray-4 min-w-0 flex-1 bg-transparent text-[14px] outline-none max-[1199px]:hidden"
        />
        <button
          type="submit"
          aria-label="검색"
          onClick={(event) => {
            // 좁은 화면에서는 입력창이 숨겨져 아이콘만 남으므로 패널을 연다.
            if (!trimmedQuery) {
              event.preventDefault();
              setIsOpen(true);
            }
          }}
          className="shrink-0"
        >
          <img src={searchIcon} alt="" className="size-[18px]" />
        </button>
      </form>

      {isOpen ? (
        <div
          style={{ width: PANEL_WIDTH }}
          className="border-gray-2 absolute top-[calc(100%+12px)] right-0 z-50 flex max-w-[calc(100vw-48px)] flex-col gap-[20px] rounded-[16px] border bg-white p-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {trimmedQuery ? (
            <ul aria-label="검색 제안" className="flex flex-col">
              <li>
                <button
                  type="button"
                  onClick={() => submitSearch(trimmedQuery)}
                  className="text-main-5 w-full rounded-[8px] px-[8px] py-[10px] text-left text-[14px] font-medium hover:bg-black/5"
                >
                  “{trimmedQuery}” 검색하기
                </button>
              </li>
              {searchSuggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => submitSearch(suggestion)}
                    className="text-gray-5 w-full rounded-[8px] px-[8px] py-[10px] text-left text-[14px] hover:bg-black/5"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <section
                aria-label="최근 검색"
                className="flex flex-col gap-[12px]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold text-black">
                    최근 검색
                  </h2>
                  {recentSearches.length > 0 ? (
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-gray-4 text-[12px]"
                    >
                      전체 삭제
                    </button>
                  ) : null}
                </div>
                {recentSearches.length === 0 ? (
                  <p className="text-gray-4 text-[12px]">
                    최근 검색기록이 없습니다.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-[8px]">
                    {recentSearches.map((search, index) => (
                      <li
                        key={`${search}-${index}`}
                        className="border-gray-2 flex items-center gap-[4px] rounded-full border bg-white py-[4px] pr-[6px] pl-[10px] text-[12px]"
                      >
                        <button
                          type="button"
                          onClick={() => selectRecentSearch(search)}
                          className="text-gray-5"
                        >
                          {search}
                        </button>
                        <button
                          type="button"
                          aria-label={`${search} 삭제`}
                          onClick={() => removeRecentSearch(index)}
                          className="text-gray-4 flex"
                        >
                          <MdClose aria-hidden="true" className="text-[14px]" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {isRegionLoading ? (
                <p className="text-gray-4 text-[12px]">
                  지역 정보를 불러오는 중이에요.
                </p>
              ) : null}
              {!isRegionLoading && isRegionError ? (
                <p role="alert" className="text-main-5 text-[12px]">
                  지역 정보를 불러오지 못했어요.
                </p>
              ) : null}

              {!isRegionLoading && !isRegionError ? (
                <>
                  <ul
                    aria-label="도시 선택"
                    className="flex [scrollbar-width:none] gap-[8px] overflow-x-auto [&::-webkit-scrollbar]:hidden"
                  >
                    {cities.map((city) => (
                      <li key={city.id} className="shrink-0">
                        <button
                          type="button"
                          onClick={() => selectCity(city)}
                          aria-pressed={city.id === selectedCityId}
                          style={{ width: CITY_SIZE, height: CITY_SIZE }}
                          className={`relative overflow-hidden rounded-full ${
                            city.id === selectedCityId
                              ? 'ring-main-5 ring-2'
                              : ''
                          }`}
                        >
                          {city.imageSrc ? (
                            <img
                              src={city.imageSrc}
                              alt=""
                              draggable={false}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : null}
                          <span className="absolute inset-0 bg-black/30" />
                          <span className="relative text-[13px] font-semibold text-white">
                            {city.name}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  {selectedCity ? (
                    <ul
                      aria-label={`${selectedCity.name} 시군구 선택`}
                      className="grid grid-cols-6 gap-x-[8px] gap-y-[12px]"
                    >
                      {visibleDistricts.map((district) => (
                        <li key={district}>
                          <button
                            type="button"
                            onClick={() => selectDistrict(district)}
                            className="text-gray-4 hover:text-main-5 w-full truncate text-left text-[12px]"
                          >
                            {district}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : null}
            </>
          )}
          <span className="sr-only">{searchPlaceholder}</span>
        </div>
      ) : null}
    </div>
  );
}

/** 화면이 바뀌면(검색 결과 이동 포함) 패널과 입력을 처음 상태로 되돌린다. */
function DesktopSearchBox() {
  const location = useLocation();

  return <SearchBox key={`${location.pathname}${location.search}`} />;
}

export default DesktopSearchBox;
