import { useGlobalScale } from '../../hooks/useGlobalScale';

const TITLE_TOP = 24;
const TITLE_LEFT = 16;
const TITLE_WIDTH = 220;
const TITLE_SIZE = 16;
const DESCRIPTION_MARGIN_TOP = 10;
const DESCRIPTION_SIZE = 10;
const DESCRIPTION_LINE_HEIGHT = 12;

interface RegionHeroProps {
  image: string;
  title: string;
  description: string;
  alt: string;
}

function RegionHero({ image, title, description, alt }: RegionHeroProps) {
  const scale = useGlobalScale();

  return (
    <section
      className="relative aspect-[342/129] w-full overflow-hidden rounded-xl"
      aria-label={alt}
    >
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/30" />

      <div
        className="absolute text-white"
        style={{
          top: TITLE_TOP * scale,
          left: TITLE_LEFT * scale,
          width: TITLE_WIDTH * scale,
        }}
      >
        <p className="font-semibold" style={{ fontSize: TITLE_SIZE * scale }}>
          {title}
        </p>
        <p
          className="line-clamp-2 font-medium"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          {description}
        </p>
      </div>
    </section>
  );
}

export default RegionHero;
