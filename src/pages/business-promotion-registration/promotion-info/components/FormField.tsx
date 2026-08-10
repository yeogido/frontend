import type { ReactNode } from 'react';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const LABEL_MARGIN_BOTTOM = 12;
const LABEL_FONT_SIZE = 16;

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
}

function FormField({ id, label, children }: FormFieldProps) {
  const scale = useGlobalScale();

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-semibold"
        style={{
          marginBottom: LABEL_MARGIN_BOTTOM * scale,
          fontSize: LABEL_FONT_SIZE * scale,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default FormField;
