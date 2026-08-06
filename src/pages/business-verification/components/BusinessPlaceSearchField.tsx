import search from '../../../assets/icons/search.svg';
import type { PlaceItem } from '../../local-recommendation/place-selection/types';

interface BusinessPlaceSearchFieldProps {
  readonly scale: number;
  readonly query: string;
  readonly results: readonly PlaceItem[];
  readonly isLoading: boolean;
  readonly selectedPlace: PlaceItem | null;
  readonly onQueryChange: (value: string) => void;
  readonly onSelect: (place: PlaceItem) => void;
  readonly onClear: () => void;
}

export function BusinessPlaceSearchField({
  scale,
  query,
  results,
  isLoading,
  selectedPlace,
  onQueryChange,
  onSelect,
  onClear,
}: BusinessPlaceSearchFieldProps) {
  const hasQuery = Boolean(query.trim());
  const isDropdownOpen = !selectedPlace && hasQuery;

  return (
    <div className="flex flex-col" style={{ gap: 12 * scale }}>
      <span
        className="font-semibold text-[#1c1c1c]"
        style={{ fontSize: 16 * scale, lineHeight: `${19 * scale}px` }}
      >
        사업장 주소
      </span>

      {selectedPlace ? (
        // 인증 요청에는 주소 문자열뿐 아니라 카카오 장소 정보(externalPlaceId,
        // 위경도)가 필수라, 주소를 직접 입력받지 않고 검색 결과에서 고른
        // 장소를 그대로 보여준다.
        <div
          className="flex items-center rounded-xl border border-[#e4e4e4] bg-[#f9f9f9]"
          style={{
            gap: 12 * scale,
            paddingInline: 14 * scale,
            paddingBlock: 10 * scale,
          }}
        >
          <span className="flex min-w-0 flex-1 flex-col" style={{ gap: 4 * scale }}>
            <span
              className="truncate font-semibold text-[#1c1c1c]"
              style={{ fontSize: 14 * scale, lineHeight: `${17 * scale}px` }}
            >
              {selectedPlace.title}
            </span>
            <span
              className="truncate text-[#7f7f7f]"
              style={{ fontSize: 12 * scale, lineHeight: `${14 * scale}px` }}
            >
              {selectedPlace.address}
            </span>
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-main-5 shrink-0 font-semibold"
            style={{ fontSize: 14 * scale, lineHeight: `${17 * scale}px` }}
          >
            변경
          </button>
        </div>
      ) : (
        <div className="relative">
          <span
            className="relative flex items-center rounded-xl border border-[#e4e4e4] bg-[#f9f9f9]"
            style={{ height: 42 * scale, paddingInline: 14 * scale }}
          >
            <input
              type="text"
              value={query}
              placeholder="가게명 또는 주소를 검색해 주세요"
              aria-label="사업장 검색"
              onChange={(event) => onQueryChange(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent font-medium text-[#1c1c1c] outline-none placeholder:text-[#7f7f7f]"
              style={{
                fontSize: 12 * scale,
                lineHeight: `${12 * scale}px`,
                paddingRight: 24 * scale,
              }}
            />
            <img
              src={search}
              alt=""
              aria-hidden="true"
              className="absolute top-1/2 -translate-y-1/2"
              style={{
                right: 14 * scale,
                width: 18 * scale,
                height: 18 * scale,
              }}
            />
          </span>

          {isDropdownOpen && (
            <ul
              className="absolute inset-x-0 z-10 overflow-y-auto rounded-xl border border-[#e4e4e4] bg-white shadow-lg"
              style={{ top: 46 * scale, maxHeight: 180 * scale }}
            >
              {isLoading && results.length === 0 && (
                <li
                  className="text-[#7f7f7f]"
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    fontSize: 12 * scale,
                    lineHeight: `${14 * scale}px`,
                  }}
                >
                  검색 중이에요
                </li>
              )}
              {!isLoading && results.length === 0 && (
                <li
                  className="text-[#7f7f7f]"
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    fontSize: 12 * scale,
                    lineHeight: `${14 * scale}px`,
                  }}
                >
                  검색 결과가 없어요
                </li>
              )}
              {results.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(place)}
                    className="flex w-full flex-col text-left"
                    style={{
                      gap: 4 * scale,
                      padding: `${10 * scale}px ${14 * scale}px`,
                    }}
                  >
                    <span
                      className="truncate font-semibold text-[#1c1c1c]"
                      style={{
                        fontSize: 14 * scale,
                        lineHeight: `${17 * scale}px`,
                      }}
                    >
                      {place.title}
                    </span>
                    <span
                      className="truncate text-[#7f7f7f]"
                      style={{
                        fontSize: 12 * scale,
                        lineHeight: `${14 * scale}px`,
                      }}
                    >
                      {place.address}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
