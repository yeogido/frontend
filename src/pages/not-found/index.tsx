import { useLocation, useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../components/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import BackButton from '../local-recommendation/components/BackButton';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 16;
const PAGE_PADDING_BOTTOM = 32;
const MESSAGE_MARGIN_TOP = 120;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 8;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 20;

interface NotFoundPageProps {
  /** 무엇을 찾지 못했는지. 삭제된 코스처럼 원인이 분명하면 바꿔 쓴다. */
  readonly title?: string;
  readonly description?: string;
}

export function NotFoundPage({
  title = '페이지를 찾을 수 없어요',
  description = '주소가 바뀌었거나 삭제된 화면일 수 있어요.',
}: NotFoundPageProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const scale = useGlobalScale();

  const handleBack = () => {
    // 주소로 바로 들어오면 뒤로 갈 곳이 앱 밖이다. location.key가 'default'면
    // 이 라우터 세션의 첫 화면이라는 뜻이라 홈으로 보낸다.
    if (location.key === 'default') {
      navigate('/', { replace: true });
      return;
    }

    navigate(-1);
  };

  return (
    <ResponsivePageShell
      mode="standalone"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-white"
    >
      <BackButton onClick={handleBack} />

      <div
        className="text-center"
        style={{ marginTop: MESSAGE_MARGIN_TOP * scale }}
      >
        <h1
          className="text-gray-5 font-semibold"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          {title}
        </h1>
        <p
          className="text-gray-4 font-medium"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          {description}
        </p>
      </div>
    </ResponsivePageShell>
  );
}

export default NotFoundPage;
