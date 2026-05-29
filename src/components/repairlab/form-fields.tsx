import type React from "react";

type Option = {
  label: string;
  value: string;
};

export function RepairFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-4">
      <legend className="mb-1 text-base font-black text-zinc-50">{title}</legend>
      {description ? (
        <p className="-mt-1 text-sm leading-6 text-zinc-400">{description}</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function RepairFieldGroup({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`grid gap-2 ${className}`}>{children}</div>;
}

export function RepairField({
  id,
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
  placeholder,
}: {
  id?: string;
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  const inputId = id ?? name;

  return (
    <RepairFieldGroup>
      <label className="text-sm font-bold text-zinc-200" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={fieldClassName}
      />
    </RepairFieldGroup>
  );
}

export function RepairSelect({
  id,
  label,
  name,
  defaultValue,
  options,
}: {
  id?: string;
  label: string;
  name: string;
  defaultValue?: string;
  options: Option[];
}) {
  const selectId = id ?? name;

  return (
    <RepairFieldGroup>
      <label className="text-sm font-bold text-zinc-200" htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        defaultValue={defaultValue}
        className={fieldClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </RepairFieldGroup>
  );
}

export function RepairTextarea({
  id,
  label,
  name,
  required = false,
  rows = 3,
  placeholder,
  className = "",
}: {
  id?: string;
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  const textareaId = id ?? name;

  return (
    <RepairFieldGroup className={`sm:col-span-2 ${className}`}>
      <label className="text-sm font-bold text-zinc-200" htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        id={textareaId}
        name={name}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className={fieldClassName}
      />
    </RepairFieldGroup>
  );
}

export function RepairSubmitButton({
  pending,
  label,
  pendingLabel,
  fullWidth = false,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`repair-button-motion repair-focus-ring min-h-11 rounded-full border border-emerald-300/40 bg-emerald-500 px-5 py-2.5 text-sm font-black text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 hover:shadow-cyan-400/20 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:shadow-none ${fullWidth ? "w-full" : "w-full sm:w-auto"}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

const fieldClassName =
  "min-h-11 w-full rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-500 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20";

