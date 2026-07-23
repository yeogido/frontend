import { Link } from 'react-router-dom';

import logo from '../../assets/icons/logo.svg';
import yeogido from '../../assets/icons/yeogido.svg';

import { useGlobalScale } from '../../hooks/useGlobalScale';

const GAP = 8;

function Logo() {
  const scale = useGlobalScale();

  return (
    <Link
      to="/"
      className="flex items-center origin-left"
      style={{
        gap: GAP,
        transform: `scale(${scale})`,
      }}
      aria-label="홈으로 이동"
    >
      <img src={logo} alt="" />
      <img src={yeogido} alt="여기도" />
    </Link>
  );
}

export default Logo;