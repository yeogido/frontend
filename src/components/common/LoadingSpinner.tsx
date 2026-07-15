import loadingIcon from '../../assets/icons/loading.svg';

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

function LoadingSpinner({
  label = '로딩 중',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`flex items-center justify-center ${className}`}
    >
      <img
        src={loadingIcon}
        alt=""
        aria-hidden="true"
        className="h-12 w-12 animate-spin"
      />
    </div>
  );
}

export default LoadingSpinner;
