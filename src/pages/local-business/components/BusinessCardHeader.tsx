import type { BusinessItem } from '../types';

function BusinessCardHeader({ business }: { business: BusinessItem }) {
  return (
    <div className="flex items-center gap-2 px-3 pt-3 pb-2">
      <img
        src={business.image}
        alt=""
        aria-hidden="true"
        className="size-10 shrink-0 rounded-full object-cover"
      />

      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold leading-none text-[#1C1C1C]">
          {business.author}
        </p>

        <p className="mt-1 text-[12px] font-normal leading-none text-[#7F7F7F]">
          {business.date}
        </p>
      </div>
    </div>
  );
}

export default BusinessCardHeader;
