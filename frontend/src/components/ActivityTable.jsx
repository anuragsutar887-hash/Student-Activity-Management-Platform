import { Link } from 'react-router-dom'
import { ArrowUpRight, Pencil, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'

export default function ActivityTable({ activities = [], onEdit, onDelete }) {
  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-y border-slate-100 dark:border-slate-800 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              <th scope="col" className="px-6 py-3">Activity</th>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{activity.name}</td>
                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{activity.category}</td>
                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{activity.date}</td>
                <td className="px-4 py-4"><StatusBadge status={activity.status} /></td>
                <td className="px-4 py-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <Link
                      to={`/student/activity/${activity.id}`}
                      aria-label={`View ${activity.name}`}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      View <ArrowUpRight size={15} />
                    </Link>
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(activity)}
                        aria-label={`Edit ${activity.name}`}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(activity)}
                        aria-label={`Delete ${activity.name}`}
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/60"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 p-4 md:hidden">
        {activities.map((activity) => (
          <article key={activity.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold leading-5 text-slate-800 dark:text-slate-200">{activity.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activity.category} · {activity.date}</p>
              </div>
              <StatusBadge status={activity.status} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <Link to={`/student/activity/${activity.id}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60">
                View <ArrowUpRight size={15} />
              </Link>
              {onEdit && (
                <button type="button" onClick={() => onEdit(activity)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Pencil size={14} /> Edit
                </button>
              )}
              {onDelete && (
                <button type="button" onClick={() => onDelete(activity)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60">
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
