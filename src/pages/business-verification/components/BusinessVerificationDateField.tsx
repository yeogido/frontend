import DatePicker from '../../../components/common/DatePicker';

interface BusinessVerificationDateFieldProps {
  readonly label: string;
  readonly value: string;
  readonly placeholder: string;
  readonly scale: number;
  readonly onChange: (value: string) => void;
}

export function BusinessVerificationDateField({
  label,
  value,
  placeholder,
  scale,
  onChange,
}: BusinessVerificationDateFieldProps) {
  return (
    <div className="flex flex-col" style={{ gap: 12 * scale }}>
      <span
        className="font-semibold text-[#1c1c1c]"
        style={{ fontSize: 16 * scale, lineHeight: `${19 * scale}px` }}
      >
        {label}
      </span>
      <DatePicker
        value={value}
        placeholder={placeholder}
        scale={scale}
        ariaLabel={`${label} 선택`}
        onChange={onChange}
      />
    </div>
  );
}
