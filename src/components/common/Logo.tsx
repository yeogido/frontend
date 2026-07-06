import { Link } from 'react-router-dom';

import logo from '../../assets/icons/logo.svg';
import yeogido from '../../assets/icons/yeogido.svg';

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2"
      aria-label="홈으로 이동"
    >
      <img src={logo} alt="" />
      <img src={yeogido} alt="여기도" />
    </Link>
  );
}

export default Logo;