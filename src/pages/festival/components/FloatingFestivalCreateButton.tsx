import addIcon from '../../../assets/icons/material-symbols_add-2-rounded.svg';

interface FloatingFestivalCreateButtonProps {
  onClick: () => void;
}

function FloatingFestivalCreateButton({
  onClick,
}: FloatingFestivalCreateButtonProps) {
  return (
    <button
      type="button"
      aria-label="행사 등록"
      onClick={onClick}
      className="fixed right-[max(24px,calc((100vw-390px)/2+24px))] bottom-[84px] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-black"
    >
      <img src={addIcon} alt="" aria-hidden="true" className="h-8 w-8" />
    </button>
  );
}

export default FloatingFestivalCreateButton;
