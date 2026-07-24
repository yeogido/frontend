interface VisitOrderHeaderProps {
  onBack: () => void;
}

function VisitOrderHeader({ onBack }: VisitOrderHeaderProps) {
  return (
    <>
      <button
        type="button"
        aria-label="이전 화면으로"
        onClick={onBack}
        className="-ml-1 flex h-6 w-6 items-center justify-center text-gray-5"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current stroke-[2.2]">
          <path d="m15 4-8 8 8 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <section className="mt-4">
        <h1 className="text-[28px] leading-[1.32] font-bold tracking-[-0.04em] text-black">
          방문 순서를
          <br />
          설정해 주세요
        </h1>
        <p className="mt-3 text-sm leading-5 tracking-[-0.03em] text-gray-5">
          드래그하여 순서를 변경할 수 있어요
        </p>
      </section>
    </>
  );
}

export default VisitOrderHeader;
