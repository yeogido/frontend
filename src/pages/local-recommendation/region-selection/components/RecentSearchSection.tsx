import { IoTimeOutline } from 'react-icons/io5';

import type { Neighborhood } from '../types';

interface RecentSearchSectionProps {
  neighborhoods: Neighborhood[];
  onSelect: (neighborhood: Neighborhood) => void;
}

function RecentSearchSection({
  neighborhoods,
  onSelect,
}: RecentSearchSectionProps) {
  if (neighborhoods.length === 0) {
    return null;
  }

  return (
    <section className="mt-8" aria-labelledby="recent-search-heading">
      <h3 id="recent-search-heading" className="text-base font-bold">
        최근 검색
      </h3>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {neighborhoods.map((neighborhood) => (
          <button
            key={neighborhood.id}
            type="button"
            onClick={() => onSelect(neighborhood)}
            className="border-gray-2 bg-pure-white flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium"
          >
            <IoTimeOutline aria-hidden="true" className="text-gray-4" />
            {neighborhood.city} {neighborhood.district}
          </button>
        ))}
      </div>
    </section>
  );
}

export default RecentSearchSection;
