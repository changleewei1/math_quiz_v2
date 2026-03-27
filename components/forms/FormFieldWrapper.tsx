import type { ReactNode } from 'react';

interface FormFieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

export default function FormFieldWrapper({
  label,
  htmlFor,
  error,
  children,
}: FormFieldWrapperProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-rose-500">{error}</p> : null}
    </div>
  );
}


