interface HeroSectionProps {
  imageUrl: string;
  title: string;
}

function HeroSection({ imageUrl, title }: HeroSectionProps) {
  return (
    <section className="relative h-[240px] overflow-hidden rounded-xl bg-[var(--color-line)] sm:h-[320px] sm:rounded-xl lg:h-[420px]">
      <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
    </section>
  );
}

export default HeroSection;
