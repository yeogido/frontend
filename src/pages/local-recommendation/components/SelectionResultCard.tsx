import { IoAdd, IoClose } from 'react-icons/io5';

interface SelectionResultCardProps<T> {
  item: T;
  title: string;
  description: string;
  imageSrc: string | null;
  imageAlt: string;
  action: 'add' | 'remove';
  disabled?: boolean;
  onItemAdd?: (item: T) => void;
  onItemRemove?: (item: T) => void;
}

function SelectionResultCard<T>({
  item,
  title,
  description,
  imageSrc,
  imageAlt,
  action,
  disabled = false,
  onItemAdd,
  onItemRemove,
}: SelectionResultCardProps<T>) {
  const isAddAction = action === 'add';
  const onAction = isAddAction ? onItemAdd : onItemRemove;

  return (
    <article
      className={
        isAddAction
          ? 'flex min-w-0 items-center gap-6'
          : 'flex h-[72px] w-full min-w-0 items-center gap-3 rounded-xl bg-white p-2'
      }
    >
      <div
        className={`bg-gray-2 shrink-0 overflow-hidden rounded-xl ${
          isAddAction ? 'h-[68px] w-[68px]' : 'h-14 w-14'
        }`}
      >
        {imageSrc ? (
          <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] leading-5 font-semibold text-black">
          {title}
        </h3>
        <p className="text-gray-5 mt-1.5 truncate text-sm leading-5">
          {description}
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onAction?.(item)}
        aria-label={`${title} ${isAddAction ? '추가' : '삭제'}`}
        className="border-gray-2 text-gray-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-white disabled:cursor-default disabled:opacity-40"
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

export default SelectionResultCard;
