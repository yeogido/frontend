import PlacePhotoModalFooter from './PlacePhotoModalFooter';
import PlacePhotoModalHeader from './PlacePhotoModalHeader';
import PlacePhotoUploader from './PlacePhotoUploader';

interface PlacePhotoModalProps {
  placeTitle: string;
  previewUrl: string | null;
  onFileChange: (file: File) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function PlacePhotoModal({
  placeTitle,
  previewUrl,
  onFileChange,
  onClose,
  onConfirm,
}: PlacePhotoModalProps) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-6"
      role="presentation"
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
        className="bg-pure-white w-full max-w-[342px] rounded-3xl p-6 shadow-[0_12px_40px_rgba(28,28,28,0.2)]"
      >
        <PlacePhotoModalHeader placeTitle={placeTitle} onClose={onClose} />
        <PlacePhotoUploader
          placeTitle={placeTitle}
          previewUrl={previewUrl}
          onFileChange={onFileChange}
        />
        <PlacePhotoModalFooter previewUrl={previewUrl} onConfirm={onConfirm} />
      </section>
    </div>
  );
}

export default PlacePhotoModal;
