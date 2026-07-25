interface PhotoToastProps {
  message: string;
}

function PhotoToast({ message }: PhotoToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="status"
      className="absolute top-[689px] left-1/2 z-20 flex min-h-10 w-[342px] -translate-x-1/2 items-center justify-center rounded-xl bg-[#1c1c1c] px-4 py-3 text-center text-[13px] leading-[1.3] font-medium text-[#f9f9f9] shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
    >
      {message}
    </div>
  );
}

export default PhotoToast;