export function BusinessVerificationField({
  label,
  value,
  placeholder,
  scale,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  scale: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col" style={{ gap: 12 * scale }}>
      <span
        className="font-semibold text-[#1c1c1c]"
        style={{ fontSize: 16 * scale, lineHeight: `${19 * scale}px` }}
      >
        {label}
      </span>
      <span
        className="relative flex items-center rounded-xl border border-[#e4e4e4] bg-[#f9f9f9] px-[14px]"
        style={{ height: 46 * scale }}
      >
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent pr-6 font-medium text-[#7f7f7f] outline-none placeholder:text-[#7f7f7f]"
          style={{ fontSize: 12 * scale, lineHeight: `${12 * scale}px` }}
        />
      </span>
    </label>
  );
}
