import {

  FaHeart as FilledHeartIcon

} from 'react-icons/fa6';
interface FavoriteButtonProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function FavoriteButton({ isActive, label, onClick }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      aria-label={`${label} 좋아요 ${isActive ? '취소' : '추가'}`}
      aria-pressed={isActive}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center text-white drop-shadow-sm"
    >
      <FilledHeartIcon
        className={`h-8 w-8 fill-current ${
          isActive ? 'text-main-5' : 'text-white'
        }`}
      />
    </button>
  );
}

export default FavoriteButton;
