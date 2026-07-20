import type { BusinessItem } from '../types';
import BusinessGridCard from './BusinessGridCard';

interface BusinessGridProps {
  businesses: BusinessItem[];
  onCardClick: (businessId: string) => void;
}

function BusinessGrid({ businesses, onCardClick }: BusinessGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-[18px]">
      {businesses.map((business) => (
        <BusinessGridCard
          key={business.id}
          business={business}
          onClick={() => onCardClick(business.id)}
        />
      ))}
    </div>
  );
}

export default BusinessGrid;
