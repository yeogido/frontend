function ReviewCardSkeleton() {
  return (
    <article
      role="status"
      aria-label="후기 정보를 불러오는 중"
      className="
        flex
        h-[115px]
        w-[220px]
        shrink-0
        flex-col
        justify-between
        rounded-xl
        bg-[#F9F9F9]
        p-4
        shadow-[0_1px_5px_rgba(0,0,0,0.07)]
        animate-pulse
      "
    >
      {/* Review */}
      <div className="flex flex-col gap-2">
        <div className="h-[14px] w-full rounded bg-[#EAEAEA]" />
        <div className="h-[14px] w-[170px] rounded bg-[#EAEAEA]" />
        <div className="h-[14px] w-[120px] rounded bg-[#EAEAEA]" />
      </div>

      {/* Footer */}
      <div className="flex items-end gap-2">
        {/* Profile */}
        <div className="h-6 w-6 rounded-full bg-[#EAEAEA]" />

        <div className="flex flex-col gap-[1px]">
          {/* Name */}
          <div className="h-3 w-[72px] rounded bg-[#EAEAEA]" />

          {/* Rating */}
          <div className="flex gap-[2px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-[9px] w-[9px] rounded-full bg-[#EAEAEA]"
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default ReviewCardSkeleton;