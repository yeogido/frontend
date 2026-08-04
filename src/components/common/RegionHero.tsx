interface RegionHeroProps {
  image: string;
  title: string;
  alt: string;
}

function RegionHero({ image, title, alt }: RegionHeroProps) {
  return (
    <section
      className="relative aspect-[342/129] w-full overflow-hidden rounded-xl"
      aria-label={title}
    >
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <p className="absolute bottom-[10.8%] left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-[14px] leading-[17px] font-semibold text-pure-white">
        {title}
      </p>
    </section>
  );
}

export default RegionHero;