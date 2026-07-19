import location from '../../../assets/icons/location.svg';
import TagChip from '../../../components/common/TagChip';

import type { BusinessItem } from '../types';

interface BusinessGridCardProps {
  business: BusinessItem;
  onClick: () => void;
}

function BusinessGridCard({ business, onClick }: BusinessGridCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[222px] w-full cursor-pointer flex-col overflow-hidden rounded-xl bg-white text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
    >
      <img
        src={business.image}
        alt={business.title}
        className="h-[115px] w-full rounded-b-lg object-cover"
      />

      <div className="flex min-h-0 flex-1 flex-col px-2 pt-2 pb-2">
        <h2 className="truncate text-[14px] font-medium leading-[16px] text-[#1C1C1C]">
          {business.title}
        </h2>

        <p className="mt-1 truncate text-[10px] font-normal leading-[11px] text-[#7F7F7F]">
          {business.description}
        </p>

        <div className="mt-3 flex items-center gap-1">
          <img
            src={location}
            alt=""
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0"
          />

          <span className="text-[12px] font-medium leading-none text-[#7F7F7F]">
            {business.location}
          </span>
        </div>

        <div className="mt-2 border-t border-[#E4E4E4]" />

        <div className="mt-2 flex w-full flex-nowrap justify-center gap-1">
          {business.tags.map((tag) => (
            <TagChip
              key={`${business.id}-${tag}`}
              type={tag}
              className="h-[20px] w-[46px]"
            />
          ))}
        </div>
      </div>
    </button>
  );
}

export default BusinessGridCard;