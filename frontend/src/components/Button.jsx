export default function Button({ children, type = 'button', variant = 'primary', loading = false, disabled = false, className = '', ...props }) {
  const variants = {
    primary: 'bg-indigo-700 text-white hover:bg-indigo-800 shadow-sm hover:-translate-y-px active:scale-[0.98]',
    secondary: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
  }
  return <button type={type} disabled={disabled || loading} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${variants[variant] ?? variants.primary} ${className}`} {...props}>{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}{children}</button>
}
