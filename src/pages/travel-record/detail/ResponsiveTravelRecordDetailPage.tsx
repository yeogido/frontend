import { DESKTOP_SCALE } from '../../../constants/layout';
import { ScaleContext } from '../../../contexts/ScaleContext';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import TravelRecordDetailPage from './index';

/** 같은 상세 화면의 요청·확인 상태를 화면 폭 변경에도 유지한다. */
export default function ResponsiveTravelRecordDetailPage() {
  const desktop = useIsDesktop();
  return (
    <ScaleContext.Provider value={desktop ? DESKTOP_SCALE : null}>
      <TravelRecordDetailPage desktop={desktop} />
    </ScaleContext.Provider>
  );
}
