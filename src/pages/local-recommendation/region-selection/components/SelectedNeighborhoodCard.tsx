import { IoClose, IoLocationOutline } from 'react-icons/io5';

import type { Neighborhood } from '../types';

interface SelectedNeighborhoodCardProps {
  neighborhood: Neighborhood;
  onClear: () => void;
}

function SelectedNeighborhoodCard({
  neighborhood,
  onClear,
}: SelectedNeighborhoodCardProps) {
  return (
    <section className="mt-6" aria-live="polite">
      <h3 className="mb-3 text-sm font-semibold">선택한 지역</h3>
      <button
        type="button"
        aria-label={`${neighborhood.district} 선택 해제`}
        onClick={onClear}
        className="border-main-5 bg-main-1 flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left"
      >
        <IoLocationOutline
          aria-hidden="true"
          className="text-main-5 shrink-0 text-xl"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">
            {neighborhood.district}
          </span>
          <span className="text-gray-4 mt-0.5 block text-xs">
            {neighborhood.province} {neighborhood.city}
          </span>
        </span>
        <IoClose
          aria-hidden="true"
          className="text-main-5 shrink-0 text-xl"
        />
      </button>
    </section>
  );
}

export default SelectedNeighborhoodCard;
