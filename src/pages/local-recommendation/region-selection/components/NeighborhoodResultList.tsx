import { IoCheckmark, IoLocationOutline } from 'react-icons/io5';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import type { Neighborhood } from '../types';

// Figma 390 디자인 기준 리터럴 px
const EMPTY_MARGIN_TOP = 24;
const EMPTY_PADDING_Y = 48;
const EMPTY_TITLE_SIZE = 14;
const EMPTY_DESC_MARGIN_TOP = 4;
const EMPTY_DESC_SIZE = 12;

const LIST_MARGIN_TOP = 24;
const HEADING_MARGIN_BOTTOM = 12;
const HEADING_SIZE = 14;
const LIST_GAP = 8;
const ITEM_MIN_HEIGHT = 60;
const ITEM_GAP = 12;
const ITEM_RADIUS = 12;
const ITEM_PADDING_X = 16;
const ITEM_PADDING_Y = 12;
const ICON_SIZE = 20;
const DISTRICT_SIZE = 14;
const META_MARGIN_TOP = 2;
const META_SIZE = 12;

interface NeighborhoodResultListProps {
  query: string;
  results: Neighborhood[];
  selectedNeighborhood: Neighborhood | null;
  onSelect: (neighborhood: Neighborhood) => void;
}

function NeighborhoodResultList({
  query,
  results,
  selectedNeighborhood,
  onSelect,
}: NeighborhoodResultListProps) {
  const scale = useGlobalScale();

  if (!query) {
    return null;
  }

  if (results.length === 0) {
    return (
      <section
        className="text-center"
        aria-live="polite"
        style={{
          marginTop: EMPTY_MARGIN_TOP * scale,
          paddingTop: EMPTY_PADDING_Y * scale,
          paddingBottom: EMPTY_PADDING_Y * scale,
        }}
      >
        <p
          className="font-semibold"
          style={{ fontSize: EMPTY_TITLE_SIZE * scale }}
        >
          검색 결과가 없어요
        </p>
        <p
          className="text-gray-4"
          style={{
            marginTop: EMPTY_DESC_MARGIN_TOP * scale,
            fontSize: EMPTY_DESC_SIZE * scale,
          }}
        >
          다른 지역명으로 다시 검색해 주세요.
        </p>
      </section>
    );
  }

  return (
    <section aria-live="polite" style={{ marginTop: LIST_MARGIN_TOP * scale }}>
      <h3
        className="font-semibold"
        style={{
          marginBottom: HEADING_MARGIN_BOTTOM * scale,
          fontSize: HEADING_SIZE * scale,
        }}
      >
        검색 결과 <span className="text-main-5">{results.length}</span>
      </h3>
      <ul className="flex flex-col" style={{ gap: LIST_GAP * scale }}>
        {results.map((neighborhood) => {
          const isSelected = selectedNeighborhood?.id === neighborhood.id;

          return (
            <li key={neighborhood.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(neighborhood)}
                className={`flex w-full items-center border text-left transition-colors ${
                  isSelected
                    ? 'border-main-5 bg-main-1'
                    : 'border-gray-2 bg-pure-white'
                }`}
                style={{
                  minHeight: ITEM_MIN_HEIGHT * scale,
                  gap: ITEM_GAP * scale,
                  borderRadius: ITEM_RADIUS * scale,
                  paddingLeft: ITEM_PADDING_X * scale,
                  paddingRight: ITEM_PADDING_X * scale,
                  paddingTop: ITEM_PADDING_Y * scale,
                  paddingBottom: ITEM_PADDING_Y * scale,
                }}
              >
                <IoLocationOutline
                  aria-hidden="true"
                  className={`shrink-0 ${isSelected ? 'text-main-5' : 'text-gray-4'}`}
                  style={{ fontSize: ICON_SIZE * scale }}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className="block font-semibold"
                    style={{ fontSize: DISTRICT_SIZE * scale }}
                  >
                    {neighborhood.district}
                  </span>
                  <span
                    className="text-gray-4 block"
                    style={{
                      marginTop: META_MARGIN_TOP * scale,
                      fontSize: META_SIZE * scale,
                    }}
                  >
                    {neighborhood.province} {neighborhood.city}
                  </span>
                </span>
                {isSelected ? (
                  <IoCheckmark
                    aria-hidden="true"
                    className="text-main-5 shrink-0"
                    style={{ fontSize: ICON_SIZE * scale }}
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default NeighborhoodResultList;
