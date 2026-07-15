import { IoAdd, IoClose } from 'react-icons/io5';

import type { FestivalItem } from '../types';

interface FestivalCardProps {
  festival: FestivalItem;
  action: 'add' | 'remove';
  disabled?: boolean;
  onAction: (festival: FestivalItem) => void;
}

function FestivalCard({
  festival,
  action,
  disabled = false,
  onAction,
}: FestivalCardProps) {
  const isAddAction = action === 'add';

  return (
    <article className="flex min-w-0 items-center gap-6">
      <div className="bg-gray-2 h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl">
        {festival.imageSrc ? (
          <img
            src={festival.imageSrc}
            alt={`${festival.title} 행사 이미지`}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] leading-5 font-semibold text-black">
          {festival.title}
        </h3>
        <p className="text-gray-5 mt-1.5 truncate text-sm leading-5">
          {festival.address}
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onAction(festival)}
        aria-label={`${festival.title} 행사 ${isAddAction ? '추가' : '삭제'}`}
        className="border-gray-2 bg-pure-white text-gray-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border disabled:cursor-default disabled:opacity-40"
      >
        {isAddAction ? (
          <IoAdd aria-hidden="true" className="text-base" />
        ) : (
          <IoClose aria-hidden="true" className="text-base" />
        )}
      </button>
    </article>
  );
}

export default FestivalCard;
