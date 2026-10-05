import { CheckCircle2, Clock3, XCircle, FileEdit } from 'lucide-react'

const badgeConfig = {
  Verified: {
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-500/30 dark:border-emerald-800',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  Pending: {
    className: 'bg-amber-50 text-amber-700 ring-amber-600/20 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-500/30 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    Icon: Clock3,
  },
  Rejected: {
    className: 'bg-rose-50 text-rose-700 ring-rose-600/20 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-500/30 dark:border-rose-800',
    iconClass: 'text-rose-600 dark:text-rose-400',
    Icon: XCircle,
  },
  Draft: {
    className: 'bg-slate-100 text-slate-700 ring-slate-500/20 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:border-slate-700',
    iconClass: 'text-slate-500 dark:text-slate-400',
    Icon: FileEdit,
  },
}

export default function StatusBadge({ status = 'Draft', showIcon = true, iconOnly = false, size = 'sm' }) {
  const config = badgeConfig[status] ?? badgeConfig.Draft
  const { Icon, className, iconClass } = config

  if (iconOnly) {
    return (
      <span
        title={status}
        className={`inline-flex items-center justify-center rounded-full p-1 ring-1 ring-inset ${className}`}
      >
        <Icon size={size === 'sm' ? 14 : 16} className={iconClass} />
        <span className="sr-only">{status}</span>
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      {showIcon && <Icon size={13} className={`shrink-0 ${iconClass}`} />}
      {status}
    </span>
  )
}
