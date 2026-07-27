import { useGlobalScale } from '../../../../hooks/useGlobalScale';

// 추정값, 실측 필요 (피그마 모바일 목업 기준 눈대중)
const HERO_HEIGHT = 240;

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
