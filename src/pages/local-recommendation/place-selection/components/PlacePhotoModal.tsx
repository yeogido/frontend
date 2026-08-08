import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import PlacePhotoModalFooter from './PlacePhotoModalFooter';
import PlacePhotoModalHeader from './PlacePhotoModalHeader';
import PlacePhotoUploader from './PlacePhotoUploader';

const DIALOG_WIDTH = 342;
const OVERLAY_PADDING_X = 24;
const OVERLAY_PADDING_Y = 16;
const DIALOG_PADDING = 24;
const DIALOG_RADIUS = 24;

interface PlacePhotoModalProps {
  placeTitle: string;
  previewUrl: string | null;
  onFileChange: (file: File) => void;
  onClose: () => void;
  onConfirm: () => void;
  /** true (default): confirm stays disabled until a photo is picked. false: confirm is always enabled (skippable). */
  requirePhoto?: boolean;
}

function PlacePhotoModal({
  placeTitle,
  previewUrl,
  onFileChange,
  onClose,
  onConfirm,
  requirePhoto = true,
}: PlacePhotoModalProps) {
  const scale = useGlobalScale();
  const overlayPaddingX = OVERLAY_PADDING_X * scale;
  const overlayPaddingY = OVERLAY_PADDING_Y * scale;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
      role="presentation"
      style={{
        paddingLeft: `max(${overlayPaddingX}px, env(safe-area-inset-left, 0px))`,
        paddingRight: `max(${overlayPaddingX}px, env(safe-area-inset-right, 0px))`,
        paddingTop: `max(${overlayPaddingY}px, env(safe-area-inset-top, 0px))`,
        paddingBottom: `max(${overlayPaddingY}px, env(safe-area-inset-bottom, 0px))`,
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-photo-modal-title"
        className="bg-pure-white flex max-h-full w-full flex-col overflow-hidden shadow-[0_12px_40px_rgba(28,28,28,0.2)]"
        style={{
          width: DIALOG_WIDTH * scale,
          maxWidth: '100%',
          padding: DIALOG_PADDING * scale,
          borderRadius: DIALOG_RADIUS * scale,
        }}
      >
        <div className="scrollbar-hide min-h-0 [scrollbar-width:none] overflow-x-hidden overflow-y-auto overscroll-contain [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <PlacePhotoModalHeader onClose={onClose} />
          <PlacePhotoUploader
            placeTitle={placeTitle}
            previewUrl={previewUrl}
            onFileChange={onFileChange}
          />
        </div>
        <PlacePhotoModalFooter
          onConfirm={onConfirm}
          disabled={requirePhoto && !previewUrl}
        />
      </section>
    </div>
  );
}

export default PlacePhotoModal;
