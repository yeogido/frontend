import { useGlobalScale } from '../../../../hooks/useGlobalScale';

const HERO_HEIGHT = 230;

interface DetailHeroImageProps {
  imageUrl: string;
  title: string;
}

function DetailHeroImage({ imageUrl, title }: DetailHeroImageProps) {
  const scale = useGlobalScale();

  return (
    <img
      src={imageUrl}
      alt={title}
      className="w-full object-cover"
      style={{ height: HERO_HEIGHT * scale }}
    />
  );
}

export default DetailHeroImage;
