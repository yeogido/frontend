import type { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
}

function FormField({ id, label, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-3 block text-base font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

export default FormField;
