import { useGlobalScale } from '../../hooks/useGlobalScale';
import TermsContent from './TermsContent';

function TermsPage() {
  const scale = useGlobalScale();
  return (
    <section
      style={{ padding: `${12 * scale}px ${24 * scale}px ${40 * scale}px` }}
    >
      <TermsContent />
    </section>
  );
}

export default TermsPage;
