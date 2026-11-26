import { DESKTOP_SCALE } from '../../constants/layout';
import { ScaleContext } from '../../contexts/ScaleContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import BusinessVerificationPage from './index';

/**
 * 인증 화면의 입력값, 업로드한 파일, 선택한 장소, 제출 상태를 화면 폭 변경에도
 * 유지한다. Responsive는 모바일과 데스크톱이 다른 루트 요소를 반환해서 1024px
 * 경계를 넘을 때 페이지가 새로 마운트되지만, 여기서는 같은 페이지를 항상
 * 같은 자리에 렌더하고 desktop prop만 바꾼다.
 */
export default function ResponsiveBusinessVerificationPage() {
  const desktop = useIsDesktop();

  return (
    <ScaleContext.Provider value={desktop ? DESKTOP_SCALE : null}>
      <BusinessVerificationPage desktop={desktop} />
    </ScaleContext.Provider>
  );
}
