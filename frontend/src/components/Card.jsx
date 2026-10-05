export default function Card({ title, value, description, Icon, iconClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' }) {
  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`} aria-hidden="true"><Icon size={21} strokeWidth={1.9} /></span>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </article>
  )
}
