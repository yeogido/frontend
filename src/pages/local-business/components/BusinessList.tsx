import type { BusinessItem } from '../types';
import BusinessListCard from './BusinessListCard';

interface BusinessListProps {
  businesses: BusinessItem[];
  onCardClick: (businessId: string) => void;
}

function BusinessList({ businesses, onCardClick }: BusinessListProps) {
  return (
    <div className="flex flex-col gap-4">
      {businesses.map((business) => (
        <BusinessListCard
          key={business.id}
          business={business}
          onClick={() => onCardClick(business.id)}
        />
      ))}
    </div>
  );
}

export default BusinessList;
