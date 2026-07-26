function RegionHeroSkeleton() {
  return (
    <section
      className="relative aspect-[342/129] w-full overflow-hidden rounded-xl bg-[#F9F9F9] animate-pulse"
      role="status"
      aria-label="지역 대표 이미지 로딩"
    >
      <div className="absolute inset-0 bg-[#EAEAEA]" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

      <div className="absolute bottom-[10.8%] left-1/2 h-[17px] w-[120px] -translate-x-1/2 rounded bg-[#D9D9D9]" />
    </section>
  );
}

export default RegionHeroSkeleton;