import type { FestivalItem } from '../types';
import FestivalCard from './FestivalCard';

interface FestivalSearchResultsProps {
  festivals: readonly FestivalItem[];
  selectedFestivalIds: ReadonlySet<string>;
  onAdd: (festival: FestivalItem) => void;
}

function FestivalSearchResults({
  festivals,
  selectedFestivalIds,
  onAdd,
}: FestivalSearchResultsProps) {
  return (
    <div className="mt-3 flex flex-col gap-4">
      {festivals.map((festival) => (
        <FestivalCard
          key={festival.id}
          festival={festival}
          action="add"
          disabled={selectedFestivalIds.has(festival.id)}
          onAction={onAdd}
        />
      ))}
    </div>
  );
}

export default FestivalSearchResults;
