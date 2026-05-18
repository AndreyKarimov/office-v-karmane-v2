import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-body-md text-on-surface font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-10 rounded border px-3 text-body-md bg-[#F8FAFC] text-on-surface placeholder:text-outline outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? "border-error ring-2 ring-error/20" : "border-outline-variant"} ${className}`}
          {...props}
        />
        {error && <p className="text-label-md text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
