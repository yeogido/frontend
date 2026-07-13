import { IoCheckmark, IoLocationOutline } from 'react-icons/io5';

import type { Neighborhood } from '../types';

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
  if (!query) {
    return null;
  }

  if (results.length === 0) {
    return (
      <section className="mt-6 py-12 text-center" aria-live="polite">
        <p className="text-sm font-semibold">검색 결과가 없어요</p>
        <p className="text-gray-4 mt-1 text-xs">
          다른 지역명으로 다시 검색해 주세요.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6" aria-live="polite">
      <h3 className="mb-3 text-sm font-semibold">
        검색 결과 <span className="text-main-5">{results.length}</span>
      </h3>
      <ul className="flex flex-col gap-2">
        {results.map((neighborhood) => {
          const isSelected = selectedNeighborhood?.id === neighborhood.id;

          return (
            <li key={neighborhood.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(neighborhood)}
                className={`flex min-h-15 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'border-main-5 bg-main-1'
                    : 'border-gray-2 bg-pure-white'
                }`}
              >
                <IoLocationOutline
                  aria-hidden="true"
                  className={`shrink-0 text-xl ${isSelected ? 'text-main-5' : 'text-gray-4'}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {neighborhood.district}
                  </span>
                  <span className="text-gray-4 mt-0.5 block text-xs">
                    {neighborhood.province} {neighborhood.city}
                  </span>
                </span>
                {isSelected ? (
                  <IoCheckmark
                    aria-hidden="true"
                    className="text-main-5 shrink-0 text-xl"
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
