import { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const fieldCls =
  "w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-green-600 dark:border-white/20 dark:bg-zinc-900 dark:text-white";
const labelCls = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function Field({
  label,
  error,
  required,
  ...props
}: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className={labelCls}>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <input className={fieldCls} {...props} />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function SelectField({
  label,
  error,
  required,
  children,
  ...props
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className={labelCls}>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <select className={fieldCls} {...props}>
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
