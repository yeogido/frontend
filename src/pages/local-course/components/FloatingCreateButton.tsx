import addIcon from '../../../assets/icons/material-symbols_add-2-rounded.svg';

interface FloatingCreateButtonProps {
  onClick: () => void;
}

function FloatingCreateButton({ onClick }: FloatingCreateButtonProps) {
  return (
    <button
      type="button"
      aria-label="코스 만들기"
      onClick={onClick}
      className="fixed right-[max(24px,calc((100vw-390px)/2+24px))] bottom-[84px] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#1C1C1C]"
    >
      <img src={addIcon} alt="" aria-hidden="true" className="h-8 w-8" />
    </button>
  );
}

export default FloatingCreateButton;
